type Contracts = {
  moonpinContract: string;
  moonboardContract: string;
};

export const contracts: { [chainID: number]: Contracts } = {
  // BTT Testnet
  1029: {
    moonpinContract: "0x55Df8B841Ee4bF34e94Af809904Bf65c6Ab0bf01",
    moonboardContract: "0x5D14244E555dAE5270959Ada9B4ab0A665Ff5f18",
  },
  
};
