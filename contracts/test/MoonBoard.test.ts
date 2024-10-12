import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { token } from "../typechain-types/@openzeppelin/contracts";

describe("MoonBoard", function () {
  async function deployMoonboardFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const MoonPinFactory = await ethers.getContractFactory("MoonPin");
    const moonPin = await MoonPinFactory.deploy();

    const MoonBoardFactory = await ethers.getContractFactory("MoonBoard");
    const moonBoard = await MoonBoardFactory.deploy(moonPin.address);
    await moonBoard.deployed();

    const createBoardFee = await moonBoard.createBoardFee();
    const pinFee = await moonBoard.pinFee();

    return { moonBoard, moonPin, owner, otherAccount, createBoardFee, pinFee };
  }

  it("Should create a moonBoard", async () => {
    const { moonBoard, moonPin, owner, createBoardFee, pinFee } =
      await loadFixture(deployMoonboardFixture);

    await moonBoard.createMoonboard(
      "test moonboard",
      ["ipfs://test-url", "ipfs://test-url2"],
      { value: createBoardFee.add(pinFee.mul(2)) }
    );

    const board = await moonBoard.getMoonboard(owner.address, 0);
    expect(board.name).to.equal("test moonboard");
    expect(board.moonpinIds[0]).to.equal(0);
    expect(board.moonpinIds[1]).to.equal(1);
    expect(board.votes).to.equal(0);
    const tokenUri = await moonPin.tokenURI(0);
    expect(tokenUri).to.equal("ipfs://test-url");
  });

  it("gets all moonboards", async () => {
    const { moonBoard, moonPin, owner, otherAccount, createBoardFee, pinFee } =
      await loadFixture(deployMoonboardFixture);

    await moonBoard.createMoonboard(
      "test moonboard",
      ["ipfs://test-url", "ipfs://test-url2"],
      { value: createBoardFee.add(pinFee.mul(2)) }
    );

    await moonBoard.createMoonboard(
      "test moonboard2",
      ["ipfs://test-url", "ipfs://test-url2"],
      { value: createBoardFee.add(pinFee.mul(2)) }
    );

    await moonBoard
      .connect(otherAccount)
      .createMoonboard(
        "test moonboard3",
        ["ipfs://test-url", "ipfs://test-url2"],
        { value: createBoardFee.add(pinFee.mul(2)) }
      );

    const boards = await moonBoard.getAllMoonboards();
    expect(boards.length).to.equal(3);
  });

  it("deletes a moonboard", async () => {
    const { moonBoard, moonPin, owner, otherAccount, createBoardFee, pinFee } =
      await loadFixture(deployMoonboardFixture);

    await moonBoard.createMoonboard(
      "test moonboard",
      ["ipfs://test-url", "ipfs://test-url2"],
      { value: createBoardFee.add(pinFee.mul(2)) }
    );

    await moonBoard.createMoonboard(
      "test moonboard2",
      ["ipfs://test-url", "ipfs://test-url2"],
      { value: createBoardFee.add(pinFee.mul(2)) }
    );

    await moonBoard
      .connect(otherAccount)
      .createMoonboard(
        "test moonboard3",
        ["ipfs://test-url", "ipfs://test-url2"],
        { value: createBoardFee.add(pinFee.mul(2)) }
      );

    await moonBoard.deleteMoonboard(0);
    await moonBoard.deleteMoonboard(0);

    const boards = await moonBoard.getAllMoonboards();

    expect(boards.length).to.equal(1);
  });

  it("votes and pins on a moonboard", async () => {
    const { moonBoard, moonPin, owner, otherAccount, createBoardFee, pinFee } =
      await loadFixture(deployMoonboardFixture);

    await moonBoard.createMoonboard(
      "test moonboard",
      ["ipfs://test-url", "ipfs://test-url2"],
      { value: createBoardFee.add(pinFee.mul(2)) }
    );

    await moonPin.vote(0);
    await moonPin.pin(0);

    const board = await moonBoard.getMoonboard(owner.address, 0);
    expect(board.votes).to.equal(1);
    expect(board.pins).to.equal(1);

    await moonPin.downvote(0);
    await moonPin.unpin(0);

    const board2 = await moonBoard.getMoonboard(owner.address, 0);
    expect(board2.votes).to.equal(0);
    expect(board2.pins).to.equal(0);
  });

  it("pins and unpins", async () => {
    const { moonBoard, moonPin, owner, otherAccount, createBoardFee, pinFee } =
      await loadFixture(deployMoonboardFixture);

    await moonBoard.createMoonboard(
      "test moonboard",
      ["ipfs://test-url", "ipfs://test-url2"],
      { value: createBoardFee.add(pinFee.mul(2)) }
    );

    await moonBoard
      .connect(otherAccount)
      .createMoonboard(
        "test moonboard2",
        ["ipfs://test-url", "ipfs://test-url2"],
        { value: createBoardFee.add(pinFee.mul(2)) }
      );

    const prevOwnerBalance = await ethers.provider.getBalance(owner.address);
    await moonBoard
      .connect(otherAccount)
      .pinToBoard(owner.address, 0, 0, { value: pinFee });
    const newOwnerBalance = await ethers.provider.getBalance(owner.address);
    expect(prevOwnerBalance).to.equal(newOwnerBalance.sub(pinFee));

    const board = await moonBoard.getMoonboard(otherAccount.address, 0);
    const sourceBoard = await moonBoard.getMoonboard(owner.address, 0);
    expect(board.externalMoonpinIds[0]).to.equal(0);

    expect(sourceBoard.pins).to.equal(1);

    await moonBoard.connect(otherAccount).unpinFromBoard(0, 0);
    const board2 = await moonBoard.getMoonboard(otherAccount.address, 0);
    const sourceBoard2 = await moonBoard.getMoonboard(owner.address, 0);
    expect(board2.externalMoonpinIds.length).to.equal(0);
    expect(sourceBoard2.pins).to.equal(0);
  });
});
