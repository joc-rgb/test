// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import '@chainlink/contracts/src/v0.8/ConfirmedOwner.sol';
import "./PoolLoan.sol";
import "hardhat/console.sol";

contract LendingPool is ChainlinkClient, ConfirmedOwner{

    using Chainlink for Chainlink.Request;
    uint floorPrice;
    address oracle;
    bytes32 jobId;
    uint256 fee;
    
    uint _loanIdCounter; 
    mapping(uint => PoolLoan) loans;
    mapping(address => bool) whitelisted;
    mapping (address=>uint) pool_share;
    uint lptoken_totalsupply;
    uint total_liquidity;
    uint128 apr;
    IERC20 WETH;
    
    constructor() ConfirmedOwner(msg.sender){
        
        lptoken_totalsupply = 0;
        apr = 20;
        //WETH lending pool
        WETH = IERC20(0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa);
        
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
        setChainlinkOracle(0x40193c8518BB267228Fc409a613bDbD8eC5a97b3);
        jobId = 'ca98366cc7314957b8c012c72f05aeeb';
        fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
    }

    modifier isWhitelisted(address _nft){
        require(whitelisted[_nft], "NFT Collection not whitelisted");
        _;
    }

    function provide_lp (uint _amount) external {
        require(_amount>0, "Amount must greater than 0");
        if(total_liquidity==0){
            provide_lp_first(_amount);
        }else{
            provide_lp_additional(_amount);
        }
    }

    function provide_lp_first(uint _amount) internal {
        //effect
        uint shares = 100;
        total_liquidity += _amount;
        lptoken_totalsupply += shares;
        pool_share[msg.sender] += shares;
        //interaction
        WETH.transferFrom(msg.sender,address(this), _amount);
        
    }

    function provide_lp_additional(uint _amount) internal {
        //effect
        uint shares = _amount*lptoken_totalsupply/total_liquidity;
        total_liquidity += _amount;
        lptoken_totalsupply += shares;
        pool_share[msg.sender] += shares;
        //interaction
        WETH.transferFrom(msg.sender,address(this), _amount);
        
    }

    function remove_lp(uint _share_amount) external {
        //check
        require(_share_amount>0, "Amount must greater than 0");
        require(_share_amount<=pool_share[msg.sender], "Exceed balance");
        //effect
        uint token_withdrawn = total_liquidity*_share_amount/lptoken_totalsupply;
        total_liquidity -= token_withdrawn;
        lptoken_totalsupply -= _share_amount;
        pool_share[msg.sender] -= _share_amount;
        //interaction
        WETH.transfer(msg.sender, token_withdrawn);
    }

    function createInstantLoan(uint128 _duration,uint _amount, address _nftAddress,uint _tokenId) external isWhitelisted(_nftAddress) returns (bool){
         
        requestFloorPrice();
        //check
        require(_amount<=floorPrice*5/10, "Exceed 50% floor price");
        require(_amount<=WETH.balanceOf(address(this))*70/100, "Not enough liquidity!");
        //effect
        uint loanId = _loanIdCounter; // get the current value of the counter
        _loanIdCounter++; // increment the counter
        total_liquidity += _amount + (_amount*_duration*apr/36500);
        PoolLoan loan = new PoolLoan(msg.sender, _duration, _amount, apr, loanId, address(this), _nftAddress, _tokenId); // create the loan
        loans[loanId] = loan; // add the auction to the map
        IERC721 _nftToken = IERC721(_nftAddress); // get the nft token
        //interaction
        _nftToken.transferFrom(msg.sender, address(loan), _tokenId); // transfer the token to the auction
        WETH.transfer(msg.sender, _amount);
        
        return true;

    }

     // Return a list of all loans
    function getPoolLoans() external view returns(address[] memory _loans) {
        _loans = new address[](_loanIdCounter); // create an array of size equal to the current value of the counter
        for(uint i = 0; i < _loanIdCounter; i++) { // for each auction
            _loans[i] = address(loans[i]); // add the address of the auction to the array
        }
        return _loans; // return the array
    }

    function getSpecificLoan(uint _id) external view returns (address borrower,
            uint128 duration,
            uint128 _apr,
            uint256 tokenIds,
            uint256 amount,
            uint256 loanIds,
            address lender,
            address nftAddress,
            uint startTime,
            uint256 loanState){
        borrower = PoolLoan(loans[_id]).getBorrower(); // get the direct buy price
            duration = PoolLoan(loans[_id]).getDuration();
            _apr = PoolLoan(loans[_id]).getAPR();
            tokenIds = PoolLoan(loans[_id]).getTokenId();
            amount = PoolLoan(loans[_id]).getAmount();
            loanIds = PoolLoan(loans[_id]).getLoanId();
            lender = PoolLoan(loans[_id]).getLender();
            nftAddress = PoolLoan(loans[_id]).getNFT();
            startTime = PoolLoan(loans[_id]).getStartTime();
            loanState = PoolLoan(loans[_id]).getStatus();
    }

    function addWhitelisted(address _nft) external onlyOwner{
        whitelisted[_nft] = true;
    }

    function removeWhitelist(address _nft) external onlyOwner{
        
        whitelisted[_nft] = false;
    }

    //--- Util Function ---//
    function requestFloorPrice() internal returns (bytes32 requestId) 
    {
        Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);

        // Set the URL to perform the GET request on
        //Mock data
        req.add('get', 'https://stoplight.io/mocks/nftport/nftport/5393499/v0/transactions/stats/0x09eeac7dff0dc304e25cbb7bdbfae798488fc34f?chain=polygon');

        req.add('path', 'statistics,floor_price'); // Chainlink nodes 1.0.0 and later support this format

        // Multiply the result by 1000000000000000000 to remove decimals
        int256 timesAmount = 10**18;
        req.addInt('times', timesAmount);

        // Sends the request
        return sendChainlinkRequest(req, fee);
    }

    function fulfill(bytes32 _requestId, uint256 _price) public recordChainlinkFulfillment(_requestId) {
        
        floorPrice = _price;
    }

    
}