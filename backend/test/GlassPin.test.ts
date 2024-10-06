import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { token } from "../typechain-types/@openzeppelin/contracts";

describe("GlassPin", function () {
  async function deployOneYearLockFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const GlassPinFactory = await ethers.getContractFactory("GlassPin");
    const GlassPin = await GlassPinFactory.deploy();
    await GlassPin.deployed();

    return { GlassPin, owner, otherAccount };
  }

  it("Should create a GlassPin", async () => {
    const { GlassPin, owner } = await loadFixture(deployOneYearLockFixture);

    await GlassPin.createGlassPin(owner.address, "ipfs://test-url");

    const tokenUri = await GlassPin.tokenURI(0);
    expect(tokenUri).to.equal("ipfs://test-url");
  });
});
