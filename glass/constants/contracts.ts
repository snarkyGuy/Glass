type Contracts = {
  GlasspinContract: string;
  GlassboardContract: string;
};

export const contracts: { [chainID: number]: Contracts } = {
  // BTT Testnet
  1029: {
    GlasspinContract: "0xB4e6351E35F98D7B1Da712C8E53A6205319D729F",
    GlassboardContract: "0x0E0016D5403C0349C717A8F09167a6e16900c222",
  },
  
};

// GlassPin deployed at address: 0xB4e6351E35F98D7B1Da712C8E53A6205319D729F
// GlassBoard deployed at address: 0x0E0016D5403C0349C717A8F09167a6e16900c222