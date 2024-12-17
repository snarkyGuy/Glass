import { Chain } from "wagmi";


export const bttcTestnet: Chain = {
  name: "BitTorrent Chain Mainnet",
  id: 199, // Ensure this ID is correct
  network: "BitTorrent Chain Mainnet", // Removed leading space
  nativeCurrency: {
    name: "BTT",
    symbol: "BTT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.bittorrentchain.io/"], // Check this URL
    },
    public: {
      http: ["https://rpc.bittorrentchain.io/"], // Check this URL
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://testnet.bttcscan.com/", // Confirm this URL
    },
  },
};

export const hederaPreviewnet: Chain = {
  name: "Hedera Previewnet",
  id: 297, // Ensure this ID is correct
  network: "Hedera Previewnet", 
  nativeCurrency: {
    name: "HBAR",
    symbol: "HBAR",
    decimals: 8, // Hedera HBAR has 8 decimal places
  },
  rpcUrls: {
    default: {
      http: ["https://previewnet.hashio.io/api"], // Check this URL
    },
    public: {
      http: ["https://previewnet.hashio.io/api"], // Check this URL
    },
  },
  blockExplorers: {
    default: {
      name: "HashScan",
      url: "https://hashscan.io/previewnet/", // Confirm this URL
    },
  },
};
