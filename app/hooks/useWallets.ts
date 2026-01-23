"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { type Address, type Hash, parseEther, formatEther, decodeEventLog, isAddress, getAddress } from "viem";
import { CONTRACTS } from "../config/contracts";
import { SAFE_SOCIAL_FACTORY_ABI, SAFE_SOCIAL_WALLET_ABI } from "../config/abis";

export interface WalletData {
  id: string;
  address: Address;
  name: string | null;
  threshold: number;
  owners: number;
  ownersList: { address: string; name: string | null }[];
  balance: string;
  pendingTxCount: number;
  chainId: number;
  createdAt: string;
}

export function useWallets() {
  const { address: userAddress } = useAccount();
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWallets = useCallback(async () => {
    if (!userAddress) {
      setWallets([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/wallets?owner=${userAddress}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch wallets");
      }

      setWallets(data.wallets || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch wallets");
      setWallets([]);
    } finally {
      setIsLoading(false);
    }
  }, [userAddress]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  return { wallets, isLoading, error, refetch: fetchWallets };
}

export function useCreateWallet() {
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createWallet = async (
    owners: Address[],
    threshold: number,
    name?: string
  ): Promise<Address | null> => {
    if (!walletClient || !publicClient || !userAddress) {
      setError("Wallet not connected");
      return null;
    }

    setIsCreating(true);
    setError(null);

    try {
      // 1. Call factory to deploy wallet on-chain
      const hash = await walletClient.writeContract({
        address: CONTRACTS.SAFE_SOCIAL_FACTORY,
        abi: SAFE_SOCIAL_FACTORY_ABI,
        functionName: "deployWallet",
        args: [owners, BigInt(threshold)],
      });

      // 2. Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // 3. Get wallet address from NewSafeSocialWallet event
      let walletAddress: Address | null = null;
      
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: SAFE_SOCIAL_FACTORY_ABI,
            data: log.data,
            topics: log.topics,
          });
          
          if (decoded.eventName === "NewSafeSocialWallet") {
            walletAddress = decoded.args.wallet as Address;
            break;
          }
        } catch {
          // Not our event, continue
        }
      }

      if (!walletAddress) {
        throw new Error("Could not find wallet address in transaction logs");
      }

      // 4. Register wallet in our database
      const response = await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: walletAddress,
          name: name || "SafeSocial Wallet",
          owners,
          threshold,
          creationTxHash: hash,
          blockNumber: receipt.blockNumber.toString(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.warn("Failed to register wallet in DB:", data.error);
        // Continue anyway - wallet was created on-chain
      }

      return walletAddress;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create wallet";
      setError(message);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return { createWallet, isCreating, error };
}

export function useWalletDetails(walletAddress: Address | undefined) {
  const publicClient = usePublicClient();
  const [details, setDetails] = useState<{
    owners: Address[];
    threshold: number;
    balance: string;
    entryPoint: Address;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    // Validate address before making calls
    if (!walletAddress || !publicClient) return;
    
    if (!isAddress(walletAddress)) {
      setError("Invalid wallet address");
      setDetails(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Ensure proper checksum
      const checksumAddress = getAddress(walletAddress);
      
      const [owners, threshold, balance, entryPoint] = await Promise.all([
        publicClient.readContract({
          address: checksumAddress,
          abi: SAFE_SOCIAL_WALLET_ABI,
          functionName: "getOwners",
        }),
        publicClient.readContract({
          address: checksumAddress,
          abi: SAFE_SOCIAL_WALLET_ABI,
          functionName: "getThreshould", // Note: typo in original contract
        }),
        publicClient.getBalance({ address: checksumAddress }),
        publicClient.readContract({
          address: checksumAddress,
          abi: SAFE_SOCIAL_WALLET_ABI,
          functionName: "entryPoint",
        }),
      ]);

      setDetails({
        owners: owners as Address[],
        threshold: Number(threshold),
        balance: formatEther(balance),
        entryPoint: entryPoint as Address,
      });
    } catch (err) {
      console.error("Failed to fetch wallet details:", err);
      setError("Failed to fetch wallet details. Is this a valid SafeSocial wallet?");
      setDetails(null);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, publicClient]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return { details, isLoading, error, refetch: fetchDetails };
}

export function useIsValidWallet(walletAddress: Address | undefined) {
  const publicClient = usePublicClient();
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!walletAddress || !publicClient) {
      setIsValid(null);
      return;
    }

    setIsLoading(true);
    publicClient
      .readContract({
        address: CONTRACTS.SAFE_SOCIAL_FACTORY,
        abi: SAFE_SOCIAL_FACTORY_ABI,
        functionName: "isSafeSocialWallet",
        args: [walletAddress],
      })
      .then((result) => setIsValid(result as boolean))
      .catch(() => setIsValid(false))
      .finally(() => setIsLoading(false));
  }, [walletAddress, publicClient]);

  return { isValid, isLoading };
}
