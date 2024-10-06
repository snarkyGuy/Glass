import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { token } from "../typechain-types/@openzeppelin/contracts";

describe("GlassBoard", function () {
  async function deployGlassboardFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const GlassPinFactory = await ethers.getContractFactory("GlassPin");
    const GlassPin = await GlassPinFactory.deploy();

    const GlassBoardFactory = await ethers.getContractFactory("GlassBoard");
    const GlassBoard = await GlassBoardFactory.deploy(GlassPin.address);
    await GlassBoard.deployed();

    const createBoardFee = await GlassBoard.createBoardFee();
    const pinFee = await GlassBoard.pinFee();

    return { GlassBoard, GlassPin, owner, otherAccount, createBoardFee, pinFee };
  }

  it("Should create a GlassBoard", async () => {
    const { GlassBoard, GlassPin, owner, createBoardFee, pinFee } =
      await loadFixture(deployGlassboardFixture);

    await GlassBoard.createGlassboard(
      "test Glassboard",
      ["ipfs://test-url", "ipfs://test-url2"],
      { value: createBoardFee.add(pinFee.mul(2)) }
    );

    const board = await GlassBoard.getGlassboard(owner.address, 0);
    expect(board.name).to.equal("test Glassboard");
    expect(board.GlasspinIds[0]).to.equal(0);
    expect(board.GlasspinIds[1]).to.equal(1);
    expect(board.votes).to.equal(0);
    const tokenUri = await GlassPin.tokenURI(0);
    expect(tokenUri).to.equal("ipfs://test-url");
  });

  it("gets all Glassboards", async () => {
    const { GlassBoard, GlassPin, owner, otherAccount, createBoardFee, pinFee } =
      await loadFixture(deployGlassboardFixture);

    await GlassBoard.createGlassboard(
      "test Glassboard",
      ["ipfs://test-url", "ipfs://test-url2"],
      { value: createBoardFee.add(pinFee.mul(2)) }
    );

    await GlassBoard.createGlassboard(
      "test Glassboard2",
      ["ipfs://test-url", "ipfs://test-url2"],
      { value: createBoardFee.add(pinFee.mul(2)) }
    );

    await GlassBoard
      .connect(otherAccount)
      .createGlassboard(
        "test Glassboard3",
        ["ipfs://test-url", "ipfs://test-url2"],
        { value: createBoardFee.add(pinFee.mul(2)) }
      );

    const boards = await GlassBoard.getAllGlassboards();
    expect(boards.length).to.equal(3);
  });

  it("deletes a Glassboard", async () => {
    const { GlassBoard, GlassPin, owner, otherAccount, createBoardFee, pinFee } =
      await loadFixture(deployGlassboardFixture);

    await GlassBoard.createGlassboard(
      "test Glassboard",
      ["ipfs://test-url", "ipfs://test-url2"],
      { value: createBoardFee.add(pinFee.mul(2)) }
    );

    await GlassBoard.createGlassboard(
      "test Glassboard2",
      ["ipfs://test-url", "ipfs://test-url2"],
      { value: createBoardFee.add(pinFee.mul(2)) }
    );

    await GlassBoard
      .connect(otherAccount)
      .createGlassboard(
        "test Glassboard3",
        ["ipfs://test-url", "ipfs://test-url2"],
        { value: createBoardFee.add(pinFee.mul(2)) }
      );

    await GlassBoard.deleteGlassboard(0);
    await GlassBoard.deleteGlassboard(0);

    const boards = await GlassBoard.getAllGlassboards();

    expect(boards.length).to.equal(1);
  });

  it("votes and pins on a Glassboard", async () => {
    const { GlassBoard, GlassPin, owner, otherAccount, createBoardFee, pinFee } =
      await loadFixture(deployGlassboardFixture);

    await GlassBoard.createGlassboard(
      "test Glassboard",
      ["ipfs://test-url", "ipfs://test-url2"],
      { value: createBoardFee.add(pinFee.mul(2)) }
    );

    await GlassPin.vote(0);
    await GlassPin.pin(0);

    const board = await GlassBoard.getGlassboard(owner.address, 0);
    expect(board.votes).to.equal(1);
    expect(board.pins).to.equal(1);

    await GlassPin.downvote(0);
    await GlassPin.unpin(0);

    const board2 = await GlassBoard.getGlassboard(owner.address, 0);
    expect(board2.votes).to.equal(0);
    expect(board2.pins).to.equal(0);
  });

  it("pins and unpins", async () => {
    const { GlassBoard, GlassPin, owner, otherAccount, createBoardFee, pinFee } =
      await loadFixture(deployGlassboardFixture);

    await GlassBoard.createGlassboard(
      "test Glassboard",
      ["ipfs://test-url", "ipfs://test-url2"],
      { value: createBoardFee.add(pinFee.mul(2)) }
    );

    await GlassBoard
      .connect(otherAccount)
      .createGlassboard(
        "test Glassboard2",
        ["ipfs://test-url", "ipfs://test-url2"],
        { value: createBoardFee.add(pinFee.mul(2)) }
      );

    const prevOwnerBalance = await ethers.provider.getBalance(owner.address);
    await GlassBoard
      .connect(otherAccount)
      .pinToBoard(owner.address, 0, 0, { value: pinFee });
    const newOwnerBalance = await ethers.provider.getBalance(owner.address);
    expect(prevOwnerBalance).to.equal(newOwnerBalance.sub(pinFee));

    const board = await GlassBoard.getGlassboard(otherAccount.address, 0);
    const sourceBoard = await GlassBoard.getGlassboard(owner.address, 0);
    expect(board.externalGlasspinIds[0]).to.equal(0);

    expect(sourceBoard.pins).to.equal(1);

    await GlassBoard.connect(otherAccount).unpinFromBoard(0, 0);
    const board2 = await GlassBoard.getGlassboard(otherAccount.address, 0);
    const sourceBoard2 = await GlassBoard.getGlassboard(owner.address, 0);
    expect(board2.externalGlasspinIds.length).to.equal(0);
    expect(sourceBoard2.pins).to.equal(0);
  });
});
