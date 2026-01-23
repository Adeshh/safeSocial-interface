import type { Address, Hex } from "viem";

// ============================================
// Wallet Types
// ============================================

export interface SafeWallet {
  id: string;
  address: Address;
  name: string | null;
  threshold: number;
  owners: WalletOwner[];
  balance: string;
  chainId: number;
  createdAt: Date;
  creationTxHash?: string;
}

export interface WalletOwner {
  id: string;
  address: Address;
  name: string | null;
  isActive: boolean;
  addedAt: Date;
}

// ============================================
// Transaction Types
// ============================================

export type TransactionStatus = 
  | "PENDING" 
  | "READY" 
  | "EXECUTED" 
  | "FAILED" 
  | "CANCELLED" 
  | "EXPIRED";

export type TransactionType = 
  | "TRANSFER" 
  | "CONTRACT_CALL" 
  | "ADD_OWNER" 
  | "REMOVE_OWNER" 
  | "CHANGE_THRESHOLD" 
  | "CUSTOM";

export interface SafeTransaction {
  id: string;
  walletId: string;
  nonce: bigint;
  to: Address;
  value: string;
  data: Hex;
  operation: number;
  safeTxHash: Hex;
  status: TransactionStatus;
  description: string | null;
  type: TransactionType;
  signatures: TransactionSignature[];
  threshold: number; // From wallet, for UI convenience
  createdAt: Date;
  createdBy: Address;
  executedAt?: Date;
  executionTxHash?: string;
}

export interface TransactionSignature {
  id: string;
  signerAddress: Address;
  signerName: string | null;
  signature: Hex;
  signedAt: Date;
}

// ============================================
// API Request/Response Types
// ============================================

export interface CreateWalletRequest {
  name?: string;
  owners: Address[];
  threshold: number;
}

export interface ProposeTransactionRequest {
  walletAddress: Address;
  to: Address;
  value: string;
  data: Hex;
  description?: string;
  type?: TransactionType;
}

export interface SubmitSignatureRequest {
  transactionId: string;
  signature: Hex;
  signerAddress: Address;
}

export interface ExecuteTransactionRequest {
  transactionId: string;
  executorAddress: Address;
}

// ============================================
// Event Types (from blockchain)
// ============================================

export interface WalletCreatedEvent {
  walletAddress: Address;
  owners: Address[];
  threshold: number;
  blockNumber: bigint;
  transactionHash: Hex;
}

export interface TransactionExecutedEvent {
  walletAddress: Address;
  safeTxHash: Hex;
  success: boolean;
  blockNumber: bigint;
  transactionHash: Hex;
}
