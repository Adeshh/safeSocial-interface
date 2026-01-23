"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { isAddress, getAddress } from "viem";

export interface SafeWallet {
  address: string;
  name: string;
  threshold: number;
  owners: number;
  balance: string;
  createdAt: string;
}

interface SafeWalletContextType {
  selectedWallet: SafeWallet | null;
  setSelectedWallet: (wallet: SafeWallet | null) => void;
  wallets: SafeWallet[];
  setWallets: (wallets: SafeWallet[]) => void;
  isLoading: boolean;
  clearSelectedWallet: () => void;
}

const SafeWalletContext = createContext<SafeWalletContextType | undefined>(undefined);

export function SafeWalletProvider({ children }: { children: ReactNode }) {
  const [selectedWallet, setSelectedWalletState] = useState<SafeWallet | null>(null);
  const [wallets, setWallets] = useState<SafeWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load selected wallet from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("selectedSafeWallet");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Validate the address before using it
        if (parsed.address && isAddress(parsed.address)) {
          // Ensure proper checksum
          parsed.address = getAddress(parsed.address);
          setSelectedWalletState(parsed);
        } else {
          // Invalid address, clear it
          localStorage.removeItem("selectedSafeWallet");
        }
      } catch {
        localStorage.removeItem("selectedSafeWallet");
      }
    }
    setIsLoading(false);
  }, []);

  // Wrapper to validate and set wallet
  const setSelectedWallet = (wallet: SafeWallet | null) => {
    if (wallet && wallet.address) {
      // Validate and checksum the address
      if (!isAddress(wallet.address)) {
        console.error("Invalid wallet address:", wallet.address);
        return;
      }
      wallet.address = getAddress(wallet.address);
    }
    setSelectedWalletState(wallet);
  };

  // Save selected wallet to localStorage
  useEffect(() => {
    if (selectedWallet) {
      localStorage.setItem("selectedSafeWallet", JSON.stringify(selectedWallet));
    } else {
      localStorage.removeItem("selectedSafeWallet");
    }
  }, [selectedWallet]);

  // Clear selected wallet
  const clearSelectedWallet = () => {
    setSelectedWalletState(null);
    localStorage.removeItem("selectedSafeWallet");
  };

  return (
    <SafeWalletContext.Provider
      value={{
        selectedWallet,
        setSelectedWallet,
        wallets,
        setWallets,
        isLoading,
        clearSelectedWallet,
      }}
    >
      {children}
    </SafeWalletContext.Provider>
  );
}

export function useSafeWallet() {
  const context = useContext(SafeWalletContext);
  if (context === undefined) {
    throw new Error("useSafeWallet must be used within a SafeWalletProvider");
  }
  return context;
}
