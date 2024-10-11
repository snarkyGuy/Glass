type Contracts = {
  GlasspinContract: string;
  GlassboardContract: string;
};

export const contracts: { [chainID: number]: Contracts } = {
  // BTT Testnet
  1029: {
    GlasspinContract: "0x34275723228747aCe2E81589e14fDa6Af21E76B5",
    GlassboardContract: "0xd673DcA21e5E1C566cDBAE01B858e95385e96A62",
  },
  
};
// GlassPin deployed at address: 0x34275723228747aCe2E81589e14fDa6Af21E76B5
// GlassBoard deployed at address: 0xd673DcA21e5E1C566cDBAE01B858e95385e96A62