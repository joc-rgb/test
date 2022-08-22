// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Loan {
    IERC20 WETH = IERC20(0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa);
    address borrower; // The address of the Loan borrower
    uint128 duration; // Day
    uint128 apr;
    uint256 tokenId; // The id of the token
    uint256 amount;
    uint256 loanId;
    IERC721 _nft; // The NFT token
    address lender;
    address nftAddress;
    uint startTime;
    LoanState status;

    enum LoanState { 
        OPEN,
        FULFILLED,
        CANCELLED,
        COMPLETED
    }

    constructor(address _borrower,uint128 _duration,uint _amount, uint128 _apr, uint _loanId, address _nftAddress,uint _tokenId){
    borrower = _borrower; // The address of the Loan borrower
    duration = _duration * 1 days;
    amount = _amount;
    apr = _apr;
    loanId = _loanId;
    _nft = IERC721(_nftAddress); // The address of the nft token
    nftAddress = _nftAddress;
    tokenId = _tokenId; // The id of the token
    status = LoanState.OPEN;
    }

    function fulfillLoan() payable external returns (bool){
        require(msg.sender != borrower); // The Loan borrower can not place a bid
        require(status == LoanState.OPEN); // The Loan must be open
        lender = msg.sender;
        status = LoanState.FULFILLED;
        startTime = block.timestamp;
        WETH.transferFrom(msg.sender, address(this), amount);
        emit LoanFulfilled(msg.sender, amount); // emit a new bid event
        return true;
    }

    function cancelLoan() external returns(bool){ // Cancel the Loan
        require(msg.sender == borrower); // Only the borrower can cancel the loan
        require(status == LoanState.OPEN); // The Loan must be open
        status = LoanState.CANCELLED;
        _nft.transferFrom(address(this), borrower, tokenId); // Transfer the NFT token to the Loan creator
        emit LoanCancelled(); // Emit Loan Canceled event
        return true;
    } 

    // Withdraw the token after the Loan is over
    function repayLoan() payable external returns(bool){
        require(msg.sender == borrower); 
        require(status == LoanState.FULFILLED);
        require(block.timestamp <= startTime+duration);
        uint total = amount+(amount*apr*duration/365 days)/100;
        status = LoanState.COMPLETED;
        WETH.transferFrom(msg.sender,lender, total); // Transfers funds to the creator
        _nft.transferFrom(address(this), borrower, tokenId); // Transfer the token to the highest bidder
        emit RepayLoan(msg.sender); // Emit a withdraw token event
        return true;
    }

    // Withdraw the funds after the Loan is expired
    function claimCollateral() external returns(bool){ 
        require(msg.sender == lender); // The lender can only withdraw the funds
        require(block.timestamp >= startTime+duration);
        require(status == LoanState.FULFILLED);
        status = LoanState.COMPLETED;
        _nft.transferFrom(address(this), lender, tokenId); // Transfers funds to the creator
        emit ClaimCollateral(msg.sender); // Emit a withdraw funds event
        return true;
    } 

    // ----read only function----
    
    function getBorrower() external view returns(address){
        return borrower;
    }

    function getDuration() external view returns(uint128){
        return duration;
    }

    function getAPR() external view returns(uint128){
        return apr;
    }
    
    function getTokenId() external view returns(uint){
        return tokenId;
    }

    function getAmount() external view returns(uint){
        return amount;
    }
    
    function getLoanId() external view returns(uint){
        return loanId;
    }
    
    function getLender() external view returns(address){
        return lender;
    }

    function getNFT() external view returns(address){
        return nftAddress;
    }
    
    function getStartTime() external view returns(uint){
        return startTime;
    }

    function getStatus() external view returns(uint){
        return uint(status);
    }

    event LoanFulfilled(address lender, uint amount); // A new bid was placed
    event RepayLoan(address withdrawer); // The Loan winner withdrawed the token
    event ClaimCollateral(address lender); // The Loan owner withdrawed the funds
    event LoanCancelled(); // The Loan was cancelled
}