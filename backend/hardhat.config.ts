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

// MoonPin deployed at address: 0x0752c7ca0d8ED90FA7170310b748923f637c8A32
// MoonBoard deployed at address: 0xB81b65Da6417eE7B63c76e99340e50061D6472Af

export default config;
