import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  paths: {
    sources: "./src",
  },
  networks: {
    bttcmainnet: {
      url: "https://rpc.bittorrentchain.io",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    hederapreviewnet: {
      url: "https://previewnet.hashio.io/api",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },

  },
};

export default config;


//https://previewnet.hashio.io/api


// GlassPin deployed at address: 0xa84289a50735206d78Aed407439fF51799f68E84
// GlassBoard deployed at address: 0x30b9a26d1a3067e705b05049DC352DC7b0DF6187