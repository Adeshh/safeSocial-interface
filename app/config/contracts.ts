import { type Address } from "viem";

// Contract addresses on Sepolia testnet
export const CONTRACTS = {
  SAFE_SOCIAL_FACTORY: "0xfd0D530b4134183763957FAA6F8103f3948e9981" as Address,
  SOCIAL_PAYMASTER: "0xDd6347561dBE6d88725B0E84a236d60F50c1C594" as Address,
  // ERC-4337 EntryPoint v0.7 on Sepolia
  ENTRY_POINT: "0x0000000071727De22E5E9d8BAf0edAc6f37da032" as Address,
  // Mock DAI token for paymaster testing
  DAI_TOKEN: "0xC42Cd56eb3Ab9088352854b5c34048300cd989e6" as Address,
} as const;

// Chain configuration
export const CHAIN_CONFIG = {
  chainId: 11155111, // Sepolia
  name: "Sepolia",
  blockExplorer: "https://sepolia.etherscan.io",
  rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
} as const;

// Helper to get explorer links
export const getExplorerLink = (type: "address" | "tx", value: string) => {
  return `${CHAIN_CONFIG.blockExplorer}/${type}/${value}`;
};
