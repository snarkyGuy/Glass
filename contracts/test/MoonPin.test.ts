import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { token } from "../typechain-types/@openzeppelin/contracts";

describe("MoonPin", function () {
  async function deployOneYearLockFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const MoonPinFactory = await ethers.getContractFactory("MoonPin");
    const moonPin = await MoonPinFactory.deploy();
    await moonPin.deployed();

    return { moonPin, owner, otherAccount };
  }

  it("Should create a moonPin", async () => {
    const { moonPin, owner } = await loadFixture(deployOneYearLockFixture);

    await moonPin.createMoonPin(owner.address, "ipfs://test-url");

    const tokenUri = await moonPin.tokenURI(0);
    expect(tokenUri).to.equal("ipfs://test-url");
  });
});
