"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

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
}

const SafeWalletContext = createContext<SafeWalletContextType | undefined>(undefined);

export function SafeWalletProvider({ children }: { children: ReactNode }) {
  const [selectedWallet, setSelectedWallet] = useState<SafeWallet | null>(null);
  const [wallets, setWallets] = useState<SafeWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load selected wallet from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("selectedSafeWallet");
    if (saved) {
      try {
        setSelectedWallet(JSON.parse(saved));
      } catch {
        localStorage.removeItem("selectedSafeWallet");
      }
    }
    setIsLoading(false);
  }, []);

  // Save selected wallet to localStorage
  useEffect(() => {
    if (selectedWallet) {
      localStorage.setItem("selectedSafeWallet", JSON.stringify(selectedWallet));
    } else {
      localStorage.removeItem("selectedSafeWallet");
    }
  }, [selectedWallet]);

  return (
    <SafeWalletContext.Provider
      value={{
        selectedWallet,
        setSelectedWallet,
        wallets,
        setWallets,
        isLoading,
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
