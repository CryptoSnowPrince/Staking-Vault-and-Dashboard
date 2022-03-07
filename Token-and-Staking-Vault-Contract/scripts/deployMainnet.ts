// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  // Mainnet
  const Router = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; // Mainnet pancake router address
  const StakingVault = "0xE50E943Bd7987fC5E82bce3610762b945303f04A"; // Temp Address
  const RewardWallet = "0x474eE70C12Aa25eBDA5b606568B8c4AB9Da550B7";

  const DividendDistributor = await ethers.getContractFactory("DividendDistributor");
  const dividendDistributor = await DividendDistributor.deploy(Router);

  await dividendDistributor.deployed();

  console.log("DividendDistributor deployed to:", dividendDistributor.address);

  const AnchorEarnBSC = await ethers.getContractFactory("AnchorEarnBSC");
  const anchorEarnBSC = await AnchorEarnBSC.deploy(StakingVault, RewardWallet);

  await anchorEarnBSC.deployed();

  console.log("AnchorEarnBSC deployed to:", anchorEarnBSC.address);

  const StakingVault = await ethers.getContractFactory("StakingVault");
  const stakingVault = await StakingVault.deploy(anchorEarnBSC.address);

  await stakingVault.deployed();

  console.log("StakingVault deployed to:", stakingVault.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
