// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;
import "./GlassPin.sol";

contract GlassBoard {
    address public GlasspinContract;
    address immutable deployer = msg.sender;


    struct Board {
        string name;
        uint[] GlasspinIds;
        uint[] externalGlasspinIds;
        address owner;
    }

    struct BoardWithMetadata {
        string name;
        uint[] GlasspinIds;
        uint[] externalGlasspinIds;
        address owner;
        uint votes;
        uint pins;
    }

    mapping(address => Board[]) public Glassboards;
    mapping(address => bool) public hasGlassboard;
    address[] public addressesWithGlassboards;
    uint public numGlassboards;
    mapping(address => bool) public payoutApecoin;

    constructor(address _GlasspinContract) {
        GlasspinContract = _GlasspinContract;
    }

    function createGlassboard(
        string memory name,
        string[] memory tokenURIs
    ) public returns (uint) {
        Board memory board = Board({
            name: name,
            GlasspinIds: new uint[](tokenURIs.length),
            externalGlasspinIds: new uint[](0) ,
            owner: msg.sender
        });

        for (uint i = 0; i < tokenURIs.length; i++) {
            uint tokenId = GlassPin(GlasspinContract).createGlassPin(
                msg.sender,
                tokenURIs[i]
            );
            board.GlasspinIds[i] = tokenId;
        }

        Glassboards[msg.sender].push(board);

        if (!hasGlassboard[msg.sender]) {
            hasGlassboard[msg.sender] = true;
            addressesWithGlassboards.push(msg.sender);
        }

        numGlassboards++;

        return Glassboards[msg.sender].length - 1;
    }

    function deleteGlassboard(uint index) public {
        require(index < Glassboards[msg.sender].length, "Invalid index");
        numGlassboards--;

        Glassboards[msg.sender][index] = Glassboards[msg.sender][
            Glassboards[msg.sender].length - 1
        ];
        Glassboards[msg.sender].pop();
    }

    function updateGlassboardName(uint index, string memory name) public {
        Glassboards[msg.sender][index].name = name;
    }

    function getGlassboard(
        address owner,
        uint index
    ) public view returns (BoardWithMetadata memory) {
        return applyMetadataToBoard(Glassboards[owner][index]);
    }

    function getGlassboards(
        address owner
    ) public view returns (BoardWithMetadata[] memory) {
        Board[] memory boards = Glassboards[owner];
        return applyMetadataToBoards(boards);
    }

    function getAllGlassboards()
        public
        view
        returns (BoardWithMetadata[] memory)
    {
        Board[] memory allGlassboards = new Board[](numGlassboards);

        uint index = 0;
        for (uint i = 0; i < addressesWithGlassboards.length; i++) {
            address owner = addressesWithGlassboards[i];
            Board[] memory boards = Glassboards[owner];
            for (uint j = 0; j < boards.length; j++) {
                allGlassboards[index] = boards[j];
                index++;
            }
        }

        return applyMetadataToBoards(allGlassboards);
    }

    function pinToBoard(
      
        uint sourceMonnpinId,
        uint targetBoardIndex
    ) public {
        // Removed pin fee requirement
      
        address pinner = msg.sender;
        Board storage targetBoard = Glassboards[pinner][targetBoardIndex];
        targetBoard.externalGlasspinIds.push(sourceMonnpinId);

        GlassPin(GlasspinContract).pin(sourceMonnpinId);
    }

    function unpinFromBoard(
        uint sourceMonnpinId,
        uint targetBoardIndex
    ) public {
        address pinner = msg.sender;
        Board storage targetBoard = Glassboards[pinner][targetBoardIndex];
        uint[] storage externalGlasspinIds = targetBoard.externalGlasspinIds;

        for (uint i = 0; i < externalGlasspinIds.length; i++) {
            if (externalGlasspinIds[i] == sourceMonnpinId) {
                externalGlasspinIds[i] = externalGlasspinIds[
                    externalGlasspinIds.length - 1
                ];
                externalGlasspinIds.pop();
                break;
            }
        }

        GlassPin(GlasspinContract).unpin(sourceMonnpinId);
    }

    function withdraw(address payable recipient, uint amount) public {
        require(msg.sender == deployer, "Only deployer can withdraw");
        recipient.transfer(amount);
    }

    function applyMetadataToBoards(
        Board[] memory boards
    ) internal view returns (BoardWithMetadata[] memory) {
        BoardWithMetadata[] memory boardsWithMetadata = new BoardWithMetadata[](
            boards.length
        );
        for (uint i = 0; i < boards.length; i++) {
            Board memory board = boards[i];
            uint votes = 0;
            uint pins = 0;
            for (uint j = 0; j < board.GlasspinIds.length; j++) {
                uint GlasspinId = board.GlasspinIds[j];
                votes += GlassPin(GlasspinContract).getVotes(GlasspinId);
                pins += GlassPin(GlasspinContract).getPins(GlasspinId);
            }

            boardsWithMetadata[i] = BoardWithMetadata({
                name: board.name,
                GlasspinIds: board.GlasspinIds,
                externalGlasspinIds: board.externalGlasspinIds,
                owner: board.owner,
                votes: votes,
                pins: pins
            });
        }

        return boardsWithMetadata;
    }

    function applyMetadataToBoard(
        Board memory board
    ) internal view returns (BoardWithMetadata memory) {
        uint votes = 0;
        uint pins = 0;
        for (uint j = 0; j < board.GlasspinIds.length; j++) {
            uint GlasspinId = board.GlasspinIds[j];
            votes += GlassPin(GlasspinContract).getVotes(GlasspinId);
            pins += GlassPin(GlasspinContract).getPins(GlasspinId);
        }

        BoardWithMetadata memory boardsWithMetadata = BoardWithMetadata({
            name: board.name,
            GlasspinIds: board.GlasspinIds,
            externalGlasspinIds: board.externalGlasspinIds,
            owner: board.owner,
            votes: votes,
            pins: pins
        });

        return boardsWithMetadata;
    }
}
