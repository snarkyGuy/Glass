import { Chain } from "wagmi";

export const bttcTestnet: Chain = {
  name: "BitTorrent Chain Donau",
  id: 1029, // Ensure this ID is correct
  network: "BitTorrent Chain Donau", // Removed leading space
  nativeCurrency: {
    name: "BTT",
    symbol: "BTT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://pre-rpc.bittorrentchain.io/"], // Check this URL
    },
    public: {
      http: ["https://pre-rpc.bittorrentchain.io/"], // Check this URL
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://testnet.bttcscan.com/", // Confirm this URL
    },
  },
};
