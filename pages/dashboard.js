import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  Heading,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { useContext, useEffect } from "react";
import NFTCard from "../components/NFTCard";
import { Web3Context } from "../context/Web3Context";
import aprCalculator from "../utils/aprCalculator";

export default function DashBoard() {
  const { loanNFTs, account, claimNFT, fetchLoanNFTs, repayLoan, cancelLoan } =
    useContext(Web3Context);
  const repay = async (e, props) => {
    e.preventDefault();
    const dur = parseInt(props.duration.toString(), 16) / 86400;
    console.log("Amount", props.amount, "Duration", dur);

    const total = ethers.utils.parseEther(
      aprCalculator(props.amount, dur, props.apr)
    );
    console.log(total);
    repayLoan(props.loanAddr, total);
  };
  const cancel = async (e, props) => {
    e.preventDefault();
    cancelLoan(props.loanAddr);
  };

  const LoanBtnText = "Repay Loan";
  const CancelBtnText = "Cancel Loan";
  useEffect(() => {
    if (account) {
      fetchLoanNFTs();
    }
  }, [account]);
  return (
    <Box w="full" h="100vh" p={6} pt={20} fontFamily={"mono"}>
      <Heading fontFamily={"mono"} fontSize={"2xl"} colorScheme={"gray"} pb={8}>
        Dashboard
      </Heading>
      <Tabs isFitted variant="enclosed" colorScheme="purple">
        <TabList mb="1em">
          <Tab>Loans</Tab>
          <Tab>Lendings</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {loanNFTs.length != 0 ? (
              loanNFTs
                .filter(
                  (loan) =>
                    loan.borrower.includes(account) && loan.loanState != "0x02"
                )
                .map((loan, index) => (
                  <NFTCard
                    key={index}
                    props={loan}
                    btnText={
                      loan.loanState == "0x01" ? LoanBtnText : CancelBtnText
                    }
                    fn={loan.loanState == "0x01" ? repay : cancel}
                  />
                ))
            ) : (
              <Text>No Loan Found</Text>
            )}
          </TabPanel>
          <TabPanel>
            {loanNFTs.length != 0 ? (
              loanNFTs
                .filter(
                  (loan) =>
                    loan.lender.includes(account) && loan.loanState == "0x01"
                )
                .map((loan, index) => {
                  const deadline = new Date(
                    ethers.BigNumber.from(loan.startTime) * 1000
                  ).toISOString();
                  //const date = deadline.getDate();
                  //const m = deadline.getMonth();
                  // const y = deadline.getYear();
                  return (
                    <NFTCard
                      key={index}
                      props={loan}
                      btnText={`Claim NFT On ${deadline.slice(0, 10)}`}
                      fn={claimNFT}
                    />
                  );
                })
            ) : (
              <Text>No Lendings Found</Text>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
