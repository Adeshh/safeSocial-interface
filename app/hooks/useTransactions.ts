"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, usePublicClient, useWalletClient, useSignMessage } from "wagmi";
import {
  type Address,
  type Hex,
  parseEther,
  encodeFunctionData,
  keccak256,
  encodeAbiParameters,
  parseAbiParameters,
  toBytes,
  concat,
  pad,
  toHex,
  numberToHex,
} from "viem";
import { CONTRACTS } from "../config/contracts";
import { SAFE_SOCIAL_WALLET_ABI, ENTRY_POINT_ABI } from "../config/abis";
import { concatenateSignatures } from "../lib/signatures";

export interface TransactionData {
  id: string;
  nonce: string;
  to: Address;
  value: string;
  data: Hex;
  callData?: Hex;
  paymasterAndData?: Hex | null;
  userOpHash: Hex;
  status: string;
  type: string;
  description: string | null;
  signatures: {
    id: string;
    signerAddress: Address;
    signerName: string | null;
    signature: Hex;
    signedAt: string;
  }[];
  signatureCount: number;
  threshold: number;
  createdAt: string;
  createdBy: Address;
  executedAt?: string;
  executionTxHash?: string; // Transaction hash on Etherscan
}

export function useTransactions(walletAddress: Address | undefined) {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (status?: string) => {
    if (!walletAddress) {
      setTransactions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = status
        ? `/api/transactions?wallet=${walletAddress}&status=${status}`
        : `/api/transactions?wallet=${walletAddress}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch transactions");
      }

      setTransactions(data.transactions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch transactions");
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, isLoading, error, refetch: fetchTransactions };
}

// Pack two uint128 values into a bytes32
// Format: high128 || low128
function packUint128(high: bigint, low: bigint): Hex {
  // Ensure values fit in 128 bits
  const maxUint128 = (BigInt(1) << BigInt(128)) - BigInt(1);
  const highClamped = high > maxUint128 ? maxUint128 : high;
  const lowClamped = low > maxUint128 ? maxUint128 : low;
  
  // Pack: (high << 128) | low
  const packed = (highClamped << BigInt(128)) | lowClamped;
  return pad(numberToHex(packed), { size: 32 }) as Hex;
}

// Build paymasterAndData for SocialPaymaster
// Format: paymaster(20) || verificationGasLimit(16) || postOpGasLimit(16) || tokenAddress(20)
function buildPaymasterAndData(
  paymasterAddress: Address,
  tokenAddress: Address
): Hex {
  const verificationGasLimit = BigInt(100000);
  const postOpGasLimit = BigInt(50000);
  
  // Pack: paymaster address (20 bytes) + verificationGasLimit (16 bytes) + postOpGasLimit (16 bytes) + token (20 bytes)
  const paymasterAndData = concat([
    paymasterAddress,
    pad(numberToHex(verificationGasLimit), { size: 16 }),
    pad(numberToHex(postOpGasLimit), { size: 16 }),
    tokenAddress,
  ]);
  
  return paymasterAndData as Hex;
}

// Build a PackedUserOperation for ERC-4337 v0.7
// Matches TestHelper.sol format
function buildPackedUserOperation(
  sender: Address,
  nonce: bigint,
  callData: Hex,
  signature: Hex = "0x",
  paymasterAndData: Hex = "0x"
) {
  // Match test values: verificationGasLimit = 500000, callGasLimit = 500000
  const verificationGasLimit = BigInt(500000);
  const callGasLimit = BigInt(500000);
  // Match test values: maxPriorityFeePerGas = 256, maxFeePerGas = 256
  // For testnet, use slightly higher values to ensure inclusion
  const maxPriorityFeePerGas = BigInt(1000000000); // 1 gwei
  const maxFeePerGas = BigInt(5000000000); // 5 gwei

  return {
    sender,
    nonce,
    initCode: "0x" as Hex,
    callData,
    // Pack gas limits: verificationGasLimit (high) || callGasLimit (low)
    // bytes32(uint256(500000) << 128 | uint256(500000))
    accountGasLimits: packUint128(verificationGasLimit, callGasLimit),
    // Match test: preVerificationGas = 500000
    preVerificationGas: BigInt(500000),
    // Pack gas fees: maxPriorityFeePerGas (high) || maxFeePerGas (low)
    // bytes32(uint256(maxPriorityFeePerGas) << 128 | uint256(maxFeePerGas))
    gasFees: packUint128(maxPriorityFeePerGas, maxFeePerGas),
    paymasterAndData,
    signature,
  };
}

// Compute userOpHash for ERC-4337 v0.7 (PackedUserOperation)
function getUserOpHash(
  userOp: ReturnType<typeof buildPackedUserOperation>,
  entryPoint: Address,
  chainId: number
): Hex {
  // Pack UserOp for hashing (v0.7 format)
  const packed = encodeAbiParameters(
    parseAbiParameters(
      "address, uint256, bytes32, bytes32, bytes32, uint256, bytes32, bytes32"
    ),
    [
      userOp.sender,
      userOp.nonce,
      keccak256(userOp.initCode),
      keccak256(userOp.callData),
      userOp.accountGasLimits as Hex,
      userOp.preVerificationGas,
      userOp.gasFees as Hex,
      keccak256(userOp.paymasterAndData),
    ]
  );

  const userOpHashInner = keccak256(packed);
  
  // Hash with entryPoint and chainId
  const fullHash = keccak256(
    encodeAbiParameters(
      parseAbiParameters("bytes32, address, uint256"),
      [userOpHashInner, entryPoint, BigInt(chainId)]
    )
  );

  return fullHash;
}

export function useProposeTransaction(walletAddress: Address | undefined) {
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient();
  const [isProposing, setIsProposing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const proposeTransaction = async (params: {
    to: Address;
    value: string; // in ETH
    data?: Hex;
    description?: string;
    type?: string;
    usePaymaster?: boolean; // Use SocialPaymaster with DAI
  }): Promise<string | null> => {
    if (!walletAddress || !publicClient || !userAddress) {
      setError("Wallet not connected");
      return null;
    }

    setIsProposing(true);
    setError(null);

    try {
      // Get current nonce from EntryPoint
      const nonce = await publicClient.readContract({
        address: CONTRACTS.ENTRY_POINT,
        abi: ENTRY_POINT_ABI,
        functionName: "getNonce",
        args: [walletAddress, BigInt(0)],
      });

      const txData = params.data || "0x";
      const valueWei = parseEther(params.value || "0");

      // Encode the execute callData
      const callData = encodeFunctionData({
        abi: SAFE_SOCIAL_WALLET_ABI,
        functionName: "execute",
        args: [params.to, valueWei, txData as Hex],
      });

      // Build paymasterAndData if using paymaster
      const paymasterAndData = params.usePaymaster
        ? buildPaymasterAndData(CONTRACTS.SOCIAL_PAYMASTER, CONTRACTS.DAI_TOKEN)
        : "0x" as Hex;

      // Build PackedUserOp and compute hash
      const userOp = buildPackedUserOperation(walletAddress, nonce as bigint, callData, "0x", paymasterAndData);
      const userOpHash = getUserOpHash(userOp, CONTRACTS.ENTRY_POINT, 11155111);

      // Save to database
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          to: params.to,
          value: valueWei.toString(),
          data: txData,
          safeTxHash: userOpHash, // We store userOpHash as safeTxHash
          nonce: (nonce as bigint).toString(),
          description: params.description,
          type: params.type || "TRANSFER",
          createdBy: userAddress,
          // Store full userOp data for execution
          callData,
          // Store paymaster info
          usePaymaster: params.usePaymaster || false,
          paymasterAndData: params.usePaymaster ? paymasterAndData : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to propose transaction");
      }

      return data.transaction.id;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to propose transaction";
      setError(message);
      return null;
    } finally {
      setIsProposing(false);
    }
  };

  return { proposeTransaction, isProposing, error };
}

export function useSignTransaction() {
  const { address: userAddress } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signTransaction = async (
    transactionId: string,
    userOpHash: Hex
  ): Promise<boolean> => {
    if (!userAddress) {
      setError("Wallet not connected");
      return false;
    }

    setIsSigning(true);
    setError(null);

    try {
      // Sign the userOpHash using personal_sign (adds EIP-191 prefix)
      // This matches: MessageHashUtils.toEthSignedMessageHash(hash) in contract
      const signature = await signMessageAsync({
        message: { raw: toBytes(userOpHash) },
      });

      // Submit signature to API
      const response = await fetch(`/api/transactions/${transactionId}/signatures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signature,
          signerAddress: userAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit signature");
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to sign transaction";
      setError(message);
      return false;
    } finally {
      setIsSigning(false);
    }
  };

  return { signTransaction, isSigning, error };
}

export function useExecuteTransaction(walletAddress: Address | undefined) {
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeTransaction = async (
    transactionId: string,
    txParams: {
      to: Address;
      value: string;
      data: Hex;
      nonce: string;
      paymasterAndData?: Hex | null;
    }
  ): Promise<Hex | null> => {
    if (!walletAddress || !walletClient || !publicClient || !userAddress) {
      setError("Wallet not connected");
      return null;
    }

    setIsExecuting(true);
    setError(null);

    try {
      // 1. Get concatenated signatures from API
      const sigResponse = await fetch(
        `/api/transactions/${transactionId}/signatures?concatenated=true`
      );
      const sigData = await sigResponse.json();

      if (!sigResponse.ok) {
        throw new Error(sigData.error || "Failed to fetch signatures");
      }

      if (!sigData.isReady) {
        throw new Error(`Not enough signatures. Have ${sigData.signatureCount}, need ${sigData.threshold}`);
      }

      // 2. Build the execute callData
      const callData = encodeFunctionData({
        abi: SAFE_SOCIAL_WALLET_ABI,
        functionName: "execute",
        args: [txParams.to, BigInt(txParams.value), txParams.data],
      });

      // 3. Build complete PackedUserOperation with signatures and optional paymaster
      const userOp = buildPackedUserOperation(
        walletAddress,
        BigInt(txParams.nonce),
        callData,
        sigData.concatenatedSignature as Hex,
        (txParams.paymasterAndData || "0x") as Hex
      );

      // 4. Submit to EntryPoint via handleOps
      const hash = await walletClient.writeContract({
        address: CONTRACTS.ENTRY_POINT,
        abi: ENTRY_POINT_ABI,
        functionName: "handleOps",
        args: [
          [userOp],
          userAddress, // beneficiary receives any leftover gas refund
        ],
      });

      // 5. Wait for receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // 6. Update transaction status in DB
      await fetch(`/api/transactions/${transactionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: receipt.status === "success" ? "EXECUTED" : "FAILED",
          executionTxHash: hash,
          executedBy: userAddress,
        }),
      });

      return hash;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to execute transaction";
      setError(message);
      return null;
    } finally {
      setIsExecuting(false);
    }
  };

  return { executeTransaction, isExecuting, error };
}

// Hook to cancel a pending transaction
export function useCancelTransaction() {
  const { address: userAddress } = useAccount();
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelTransaction = async (transactionId: string): Promise<boolean> => {
    if (!userAddress) {
      setError("Wallet not connected");
      return false;
    }

    setIsCancelling(true);
    setError(null);

    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CANCELLED",
          cancelledBy: userAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel transaction");
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to cancel transaction";
      setError(message);
      return false;
    } finally {
      setIsCancelling(false);
    }
  };

  return { cancelTransaction, isCancelling, error };
}

// Hook to check EntryPoint deposit balance for a wallet
export function useEntryPointDeposit(walletAddress: Address | undefined) {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [balance, setBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!walletAddress || !publicClient) return;

    setIsLoading(true);
    try {
      const bal = await publicClient.readContract({
        address: CONTRACTS.ENTRY_POINT,
        abi: ENTRY_POINT_ABI,
        functionName: "balanceOf",
        args: [walletAddress],
      });
      setBalance((bal as bigint).toString());
    } catch (err) {
      console.error("Failed to fetch EntryPoint balance:", err);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, publicClient]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Deposit ETH to EntryPoint for the wallet
  const deposit = async (amount: string): Promise<boolean> => {
    if (!walletAddress || !walletClient || !publicClient) return false;

    setIsDepositing(true);
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACTS.ENTRY_POINT,
        abi: ENTRY_POINT_ABI,
        functionName: "depositTo",
        args: [walletAddress],
        value: parseEther(amount),
      });

      await publicClient.waitForTransactionReceipt({ hash });
      await fetchBalance();
      return true;
    } catch (err) {
      console.error("Failed to deposit:", err);
      return false;
    } finally {
      setIsDepositing(false);
    }
  };

  return { balance, isLoading, deposit, isDepositing, refetch: fetchBalance };
}
