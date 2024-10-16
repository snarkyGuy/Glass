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

// GlassPin deployed at address: 0xf26f160901C4fF21023746658c4148895EEB48cf
// GlassBoard deployed at address: 0x69b056A09249b5c7d4bb8f9d39b1c0E13d4dEe36