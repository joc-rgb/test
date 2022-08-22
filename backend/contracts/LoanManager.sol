// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "./Loan.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LoanManager is Ownable{
    uint _loanIdCounter; 
    mapping(uint => Loan) loans;
    mapping(address => bool) whitelisted;

    modifier isWhitelisted(address _nft){
        require(whitelisted[_nft], "NFT Collection not whitelisted");
        _;
    }

    function createP2PLoan(uint128 _duration,uint _amount, uint128 _apr,address _nftAddress,uint _tokenId) external isWhitelisted(_nftAddress) returns (bool) {
        require(_amount > 0); // loan amount must be greater than 0
        require(_duration >= 1); // loan duration must greater than 1

       uint loanId = _loanIdCounter; // get the current value of the counter
        _loanIdCounter++; // increment the counter
        Loan loan = new Loan(msg.sender, _duration, _amount, _apr, loanId, _nftAddress, _tokenId); // create the loan
        IERC721 _nftToken = IERC721(_nftAddress); // get the nft token
        _nftToken.transferFrom(msg.sender, address(loan), _tokenId); // transfer the token to the loan
        loans[loanId] = loan; // add the loan to the map
        return true;
    } 

    function addWhitelisted(address _nft) external onlyOwner{
        whitelisted[_nft] = true;
    }

    function removeWhitelist(address _nft) external onlyOwner{
        whitelisted[_nft] = false;
    }
    //--- Read Only ---//

     // Return a list of all loans
     function getTotalLoan() external view returns(uint){
        return _loanIdCounter;
     }
     
    function getP2PLoans() external view returns(address[] memory _loans) {
        _loans = new address[](_loanIdCounter); // create an array of size equal to the current value of the counter
        for(uint i = 0; i < _loanIdCounter; i++) { // for each loan
            _loans[i] = address(loans[i]); // add the address of the loan to the array
        }
        return _loans; // return the array
    }

    function getSpecificLoanById(uint _id) external view returns (address borrower,
            uint128 duration,
            uint128 apr,
            uint256 tokenIds,
            uint256 amount,
            uint256 loanIds,
            address lender,
            address nftAddress,
            uint startTime,
            uint256 loanState,
            address loanAddr){
        borrower = Loan(loans[_id]).getBorrower(); // get the direct buy price
            duration = Loan(loans[_id]).getDuration();
            apr = Loan(loans[_id]).getAPR();
            tokenIds = Loan(loans[_id]).getTokenId();
            amount = Loan(loans[_id]).getAmount();
            loanIds = Loan(loans[_id]).getLoanId();
            lender = Loan(loans[_id]).getLender();
            nftAddress = Loan(loans[_id]).getNFT();
            startTime = Loan(loans[_id]).getStartTime();
            loanState = Loan(loans[_id]).getStatus();
            loanAddr = address(loans[_id]);
    }

    // Return the information of each loan address
    function getP2PLoanInfo(uint _loanList)
        external
        view
        returns (
            address[] memory borrower,
            uint128[] memory duration,
            uint128[] memory apr,
            uint256[] memory tokenIds,
            uint256[] memory amount,
            uint256[] memory loanIds,
            address[] memory lender,
            address[] memory nftAddress,
            uint [] memory startTime,
            uint256[] memory loanState,
            address[] memory loanAddr
        )
    {
        borrower = new address[](_loanList);
        duration = new uint128[](_loanList);
        apr = new uint128[](_loanList);
        tokenIds = new uint256[](_loanList);
        amount = new uint256[](_loanList);
        loanIds = new uint256[](_loanList);
        lender = new address[](_loanList); // create an array of size equal to the length of the passed array
        nftAddress = new address[](_loanList);
        startTime = new uint256[](_loanList);
        loanState = new uint256[](_loanList);
        loanAddr = new address[](_loanList);
        for (uint256 i = 0; i < _loanList; i++) { 

            borrower[i] = Loan(loans[i]).getBorrower(); 
            duration[i] = Loan(loans[i]).getDuration();
            apr[i] = Loan(loans[i]).getAPR();
            tokenIds[i] = Loan(loans[i]).getTokenId();
            amount[i] = Loan(loans[i]).getAmount();
            loanIds[i] = Loan(loans[i]).getLoanId();
            lender[i] = Loan(loans[i]).getLender();
            nftAddress[i] = Loan(loans[i]).getNFT();
            startTime[i] = Loan(loans[i]).getStartTime();
            loanState[i] = Loan(loans[i]).getStatus();
            loanAddr[i] = address(loans[i]);
        }
        
        return ( // return the arrays
            borrower,
            duration,
            apr,
            tokenIds,
            amount,
            loanIds,
            lender,
            nftAddress,
            startTime,
            loanState,
            loanAddr
        );
    }
}