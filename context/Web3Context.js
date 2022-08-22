import React, { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import Web3Modal, { connectors } from "web3modal";
import { providerOptions } from "./web3Modal";
import * as UAuthWeb3Modal from "./UAuthWeb3";
import axios from "axios";
import {
  LoanManagerAddr,
  LendingPoolAddr,
  LoanManagerABI,
  LendingPoolABI,
  NFTABI,
  LoanABI,
  ERC20ABI,
  WETH,
} from "./constant";

export const Web3Context = React.createContext();

const fetchERC20Contract = (address, signerOrProvider) => {
  return new ethers.Contract(address, ERC20ABI, signerOrProvider);
};
const fetchNFTContract = (address, signerOrProvider) => {
  return new ethers.Contract(address, NFTABI, signerOrProvider);
};

const fetchLoanManagerContract = (signerOrProvider) => {
  return new ethers.Contract(LoanManagerAddr, LoanManagerABI, signerOrProvider);
};

const fetchLoanContract = (address, signerOrProvider) => {
  return new ethers.Contract(address, LoanABI, signerOrProvider);
};

export const Web3Provider = ({ children }) => {
  const whitelist = "0xa08dd49354f6cb9d11b43d09ec8607f620c1facd";
  const [web3Modal, setWeb3Modal] = useState();
  const [currentAddress, setCurrentAddress] = useState();
  const [provider, setProvider] = useState();
  const [library, setLibrary] = useState();
  const [account, setAccount] = useState();
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");
  const [chainId, setChainId] = useState();
  const [network, setNetwork] = useState();
  const [message, setMessage] = useState("");
  const [signedMessage, setSignedMessage] = useState("");
  const [signer, setSigner] = useState("");
  const [userNFTs, setUserNFTs] = useState();
  const [loanNFTs, setLoanNFTs] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const web3modal = new Web3Modal({
        network: "polygon", // optional
        cacheProvider: true, // optional
        providerOptions, // required
      });

      setWeb3Modal(web3modal);
    }
  }, []);

  const fetchLoanNFTs = useCallback(async () => {
    try {
      const contract = fetchLoanManagerContract(library);
      const res = await contract.getTotalLoan();
      const count = res.toNumber();
      console.log("count:", count);
      const loans = await contract.getP2PLoanInfo(count);
      let loanList = [];
      console.log(loans);
      for (let i = 0; i < loans.amount.length; i++) {
        let amount = ethers.utils.formatEther(loans.amount[i]._hex);
        let apr = loans.apr[i].toNumber();
        let duration = loans.duration[i]._hex;
        let loanIds = loans.loanIds[i]._hex;
        let tokenIds = ethers.utils.hexValue(loans.tokenIds[i]._hex).slice(2);
        let loanState = loans.loanState[i]._hex;
        let startTime = loans.startTime[i]._hex;
        let image;
        let collection;
        await axios
          .get(
            `https://api.covalenthq.com/v1/80001/tokens/${loans.nftAddress[i]}/nft_metadata/${tokenIds}/?quote-currency=USD&format=JSON&key=ckey_060afefc7bb747159c2bc70683e`
          )
          .then(async (res) => {
            const data = res.data.data.items;
            console.log(data);
            collection = data[0].contract_name;
            image = data[0].nft_data[0].external_data.image_512;
          });
        let loan = {
          amount: amount,
          apr: apr,
          loanIds: loanIds,
          duration: duration,
          borrower: loans.borrower[i],
          lender: loans.lender[i],
          duration: duration,
          loanAddr: loans.loanAddr[i],
          loanState: loanState,
          nftAddress: loans.nftAddress[i],
          startTime: startTime,
          tokenIds: tokenIds,
          image: image,
          collection: collection,
        };
        loanList.push(loan);
      }
      setLoanNFTs(loanList);
      console.log("Loans: ", loanNFTs);
    } catch (err) {
      console.log(err);
    }
  }, [library, loanNFTs]);

  const connectWallet = useCallback(async () => {
    try {
      const provider = await web3Modal.connect();
      const library = new ethers.providers.Web3Provider(provider);
      const signer = library.getSigner();
      setSigner(signer);
      const accounts = await library.listAccounts();
      const network = await library.getNetwork();
      setProvider(provider);
      setLibrary(library);
      if (accounts) {
        setAccount(accounts[0]);
      }

      setChainId(network.chainId);
    } catch (error) {
      setError(error);
    }
  }, [web3Modal]);

  const disconnect = async () => {
    web3Modal.clearCachedProvider();
    setAccount();
    setChainId();
    setNetwork("");
    setMessage("");
    setSignature("");
  };

  const fetchUserNFTs = async (account) => {
    console.log(account);
    await axios
      .get(
        `https://polygon-mumbai.g.alchemy.com/nft/v2/demo/getNFTs?owner=${account}`
      )
      .then(async (res) => {
        console.log(res);
        const nfts = res.data.ownedNfts.filter((nft) =>
          nft.contract.address.includes(whitelist)
        );
        setUserNFTs(nfts);
        console.log(userNFTs);
      });
  };

  const requestApproval = async (addr, tokenId) => {
    const Nftcontract = fetchNFTContract(addr, signer);
    const isApproved = await Nftcontract.getApproved(tokenId);
    console.log(isApproved);
    if (!isApproved.includes(LoanManagerAddr)) {
      const approvetx = await Nftcontract.approve(LoanManagerAddr, tokenId);
      await approvetx.wait();
    }
  };
  const requestLoan = async ({ ...collateral }, amount, rate, duration) => {
    const { addr, tokenId } = { ...collateral };
    await requestApproval(addr, tokenId).then(async () => {
      const LoanManagerContract = fetchLoanManagerContract(signer);
      const tx = await LoanManagerContract.createP2PLoan(
        duration,
        ethers.utils.parseEther(amount.toString()),
        rate,
        addr,
        tokenId
      );
      await tx.wait();
    });
  };

  const fulfillLoan = async (addr, amount) => {
    console.log(addr, amount);
    const erc20Contract = fetchERC20Contract(WETH, signer);

    const allowance = await erc20Contract.allowance(account, addr);
    console.log(allowance);

    if (ethers.utils.formatEther(allowance) < amount) {
      const tx0 = await erc20Contract.approve(addr, amount);
      await tx0.wait();
    }
    const loanContract = fetchLoanContract(addr, signer);
    const tx = await loanContract.fulfillLoan();
    await tx.wait();
  };

  const cancelLoan = async (addr) => {
    const loanContract = fetchLoanContract(addr, signer);
    const tx = await loanContract.cancelLoan();
    await tx.wait();
  };

  const claimNFT = async (addr) => {
    const loanContract = fetchLoanContract(addr, signer);
    const tx = await loanContract.claimCollateral();
    await tx.wait();
  };
  const repayLoan = async (addr, total) => {
    const erc20Contract = fetchERC20Contract(WETH, signer);

    const allowance = await erc20Contract.allowance(account, addr);
    console.log(allowance, total);
    if (ethers.utils.formatEther(allowance) < total) {
      const tx0 = await erc20Contract.approve(addr, total);
      await tx0.wait();
    }
    const loanContract = fetchLoanContract(addr, signer);
    const tx = await loanContract.repayLoan();
    await tx.wait();
  };
  const whitelistNFT = async (addr) => {
    const contract = fetchLoanManagerContract(signer);
    const tx = await contract.addWhitelisted(whitelist);
    tx.wait();
    console.log("success");
  };
  const checkIfWalletConnected = async () => {
    if (web3Modal?.cachedProvider) {
      console.log("reconnect...", web3Modal.cachedProvider);
      connectWallet();
    }
  };
  useEffect(() => {
    checkIfWalletConnected();
  }, []);

  const value = {
    currentAddress,
    connectWallet,
    disconnect,
    fetchUserNFTs,
    requestLoan,
    fulfillLoan,
    whitelistNFT,
    fetchLoanNFTs,
    claimNFT,
    cancelLoan,
    repayLoan,
    loanNFTs,
    userNFTs,
    account,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
