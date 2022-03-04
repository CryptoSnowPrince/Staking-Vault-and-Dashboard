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
  // const Greeter = await ethers.getContractFactory("Greeter");
  // const greeter = await Greeter.deploy("Hello, Hardhat!");

  // await greeter.deployed();

  // console.log("Greeter deployed to:", greeter.address);

  // for only testnet
  const Router = "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3";
  const StakingVault_addr = "0xE50E943Bd7987fC5E82bce3610762b945303f04A";
  const RewardWallet_addr = "0x36285fDa2bE8a96fEb1d763CA77531D696Ae3B0b";

  const DividendDistributor = await ethers.getContractFactory("DividendDistributor");
  const dividendDistributor = await DividendDistributor.deploy(Router);

  await dividendDistributor.deployed();

  console.log("DividendDistributor deployed to:", dividendDistributor.address);

  const AnchorEarnBSC = await ethers.getContractFactory("AnchorEarnBSC");
  const anchorEarnBSC = await AnchorEarnBSC.deploy(StakingVault_addr, RewardWallet_addr);

  await anchorEarnBSC.deployed();

  console.log("AnchorEarnBSC deployed to:", anchorEarnBSC.address);

  // const anchorEarnBSC_addr = "0x4c9E1b387Ae35db18Fe92dB94eD0BBe1A47A997d";

  // const StakingVault = await ethers.getContractFactory("StakingVault");
  // // const stakingVault = await StakingVault.deploy(anchorEarnBSC.address);
  // const stakingVault = await StakingVault.deploy(anchorEarnBSC_addr);

  // await stakingVault.deployed();

  // console.log("StakingVault deployed to:", stakingVault.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
