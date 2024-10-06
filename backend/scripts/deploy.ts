import { ethers } from "hardhat";

async function main() {
  const GlassPin = await ethers.getContractFactory("GlassPin");
  const GlassPin = await GlassPin.deploy();
  await GlassPin.deployed();

  const GlassBoard = await ethers.getContractFactory("GlassBoard");
  const GlassBoard = await GlassBoard.deploy(GlassPin.address);

  console.log(`GlassPin deployed at address: ${GlassPin.address}`);
  console.log(`GlassBoard deployed at address: ${GlassBoard.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
