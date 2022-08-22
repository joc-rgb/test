// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  /** 
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;

  const lockedAmount = hre.ethers.utils.parseEther("1");

  const Lock = await hre.ethers.getContractFactory("Lock");
  const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

  await lock.deployed();

  console.log("Lock with 1 ETH deployed to:", lock.address);
  */

  const LoanManager = await ethers.getContractFactory("LoanManager"); // Loan Manager contract
  const loanManager = await LoanManager.deploy(); // Loan Manager contract instance
  await loanManager.deployed(); // wait for contract to be deployed
  console.log("Loan Manager deployed to:", loanManager.address); // Loan Manager contract address
  //0xA28a246E864a35a78464CCc6B285d37657c198a7
  /** 
  const LendingPool = await ethers.getContractFactory("LendingPool"); // Loan Manager contract
  const lendingPool = await LendingPool.deploy(); // Loan Manager contract instance
  await lendingPool.deployed(); // wait for contract to be deployed
  console.log("Lending Pool deployed to:", lendingPool.address); // Loan Manager contract address
  //0xbf551810ddC86697a6Cb4cc9FDee2fe07c03761b*/
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
