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
    bttctestnet: {
      url: "https://pre-rpc.bittorrentchain.io/",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },

  },
};

export default config;
