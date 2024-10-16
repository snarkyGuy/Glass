// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "./GlassPin.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract GlassBoard is ReentrancyGuard {
    address public glassPinContract;
    address public immutable deployer;
    uint256 public creatorPinFee = 75; // Creator's pin fee in basis points (75/10000)
    uint256 public feeDenominator = 10000; // For calculating fees in basis points

    struct Board {
        string name;
        uint256[] pinIds;
        uint256[] externalPinIds;
        address owner;
    }

    struct BoardMetadata {
        string name;
        uint256[] pinIds;
        uint256[] externalPinIds;
        address owner;
        uint256 totalVotes;
        uint256 totalPins;
    }

    mapping(address => Board[]) public userBoards;
    mapping(address => bool) public hasBoard;
    address[] public usersWithBoards;
    uint256 public totalBoards;
    mapping(address => bool) public allowPayoutInApecoin;

    // Events
    event BoardCreated(address indexed creator, uint256 indexed boardIndex, string name);
    event BoardDeleted(address indexed owner, uint256 indexed boardIndex);
    event PinAdded(address indexed pinner, uint256 indexed boardIndex, uint256 pinId);
    event PinRemoved(address indexed pinner, uint256 indexed boardIndex, uint256 pinId);
    event CreatorFeeUpdated(uint256 newFee);
    event Withdraw(address indexed recipient, uint256 amount);

    constructor(address _glassPinContract) {
        glassPinContract = _glassPinContract;
        deployer = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == deployer, "Only deployer can perform this action");
        _;
    }

    modifier boardExists(address owner, uint256 boardIndex) {
        require(boardIndex < userBoards[owner].length, "Invalid board index");
        _;
    }

    function createBoard(
        string memory name,
        string[] memory pinURIs
    ) external nonReentrant returns (uint256) {
        require(bytes(name).length > 0, "Board name cannot be empty");
        Board memory newBoard = Board({
            name: name,
            pinIds: new uint256[](pinURIs.length),
            externalPinIds: new uint[](0) ,
            owner: msg.sender
        });

        for (uint256 i = 0; i < pinURIs.length; i++) {
            uint256 pinId = GlassPin(glassPinContract).createGlassPin(
                msg.sender,
                pinURIs[i]
            );
            newBoard.pinIds[i] = pinId;
        }

        userBoards[msg.sender].push(newBoard);

        if (!hasBoard[msg.sender]) {
            hasBoard[msg.sender] = true;
            usersWithBoards.push(msg.sender);
        }

        totalBoards++;

        emit BoardCreated(msg.sender, userBoards[msg.sender].length - 1, name);
        return userBoards[msg.sender].length - 1;
    }

    function deleteBoard(uint256 index) external nonReentrant boardExists(msg.sender, index) {
        totalBoards--;
        userBoards[msg.sender][index] = userBoards[msg.sender][userBoards[msg.sender].length - 1];
        userBoards[msg.sender].pop();

        emit BoardDeleted(msg.sender, index);
    }

    function updateBoardName(uint256 index, string memory newName) external boardExists(msg.sender, index) {
        require(bytes(newName).length > 0, "Name cannot be empty");
        userBoards[msg.sender][index].name = newName;
    }

    function getBoard(address owner, uint256 index)
        external
        view
        boardExists(owner, index)
        returns (BoardMetadata memory)
    {
        return _generateBoardMetadata(userBoards[owner][index]);
    }

    function getUserBoards(address owner)
        external
        view
        returns (BoardMetadata[] memory)
    {
        Board[] memory boards = userBoards[owner];
        return _generateBoardsMetadata(boards);
    }

    function getAllBoards() external view returns (BoardMetadata[] memory) {
        Board[] memory allBoards = new Board[](totalBoards);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < usersWithBoards.length; i++) {
            address boardOwner = usersWithBoards[i];
            Board[] memory boards = userBoards[boardOwner];
            for (uint256 j = 0; j < boards.length; j++) {
                allBoards[currentIndex] = boards[j];
                currentIndex++;
            }
        }

        return _generateBoardsMetadata(allBoards);
    }

    function pinToBoard(uint256 pinId, uint256 boardIndex) external boardExists(msg.sender, boardIndex) {
        Board storage targetBoard = userBoards[msg.sender][boardIndex];
        targetBoard.externalPinIds.push(pinId);

        GlassPin(glassPinContract).pin(pinId);

        emit PinAdded(msg.sender, boardIndex, pinId);
    }

    function unpinFromBoard(uint256 pinId, uint256 boardIndex) external boardExists(msg.sender, boardIndex) {
        Board storage targetBoard = userBoards[msg.sender][boardIndex];
        uint256[] storage externalPinIds = targetBoard.externalPinIds;

        for (uint256 i = 0; i < externalPinIds.length; i++) {
            if (externalPinIds[i] == pinId) {
                externalPinIds[i] = externalPinIds[externalPinIds.length - 1];
                externalPinIds.pop();
                break;
            }
        }

        GlassPin(glassPinContract).unpin(pinId);

        emit PinRemoved(msg.sender, boardIndex, pinId);
    }

    function updateCreatorFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10% (1000 basis points)
        creatorPinFee = newFee;
        emit CreatorFeeUpdated(newFee);
    }

    function withdraw(address payable recipient, uint256 amount) external onlyOwner nonReentrant {
        require(address(this).balance >= amount, "Insufficient balance");
        recipient.transfer(amount);

        emit Withdraw(recipient, amount);
    }

    function _generateBoardsMetadata(Board[] memory boards)
        internal
        view
        returns (BoardMetadata[] memory)
    {
        BoardMetadata[] memory boardsMetadata = new BoardMetadata[](boards.length);
        for (uint256 i = 0; i < boards.length; i++) {
            boardsMetadata[i] = _generateBoardMetadata(boards[i]);
        }
        return boardsMetadata;
    }

    function _generateBoardMetadata(Board memory board)
        internal
        view
        returns (BoardMetadata memory)
    {
        uint256 votes = 0;
        uint256 pins = 0;
        for (uint256 j = 0; j < board.pinIds.length; j++) {
            uint256 pinId = board.pinIds[j];
            votes += GlassPin(glassPinContract).getVotes(pinId);
            pins += GlassPin(glassPinContract).getPins(pinId);
        }

        return BoardMetadata({
            name: board.name,
            pinIds: board.pinIds,
            externalPinIds: board.externalPinIds,
            owner: board.owner,
            totalVotes: votes,
            totalPins: pins
        });
    }

    // Allow contract to accept ETH
    receive() external payable {}
}
