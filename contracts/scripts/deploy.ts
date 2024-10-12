import { ethers } from "hardhat";

async function main() {
  const GlassPin = await ethers.getContractFactory("GlassPin");
  const glassPin = await GlassPin.deploy();
  await glassPin.deployed();

  const GlassBoard = await ethers.getContractFactory("GlassBoard");
  const glassBoard = await GlassBoard.deploy(glassPin.address);

  console.log(`GlassPin deployed at address: ${glassPin.address}`);
  console.log(`GlassBoard deployed at address: ${glassBoard.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
