"use client";

import { useAccount } from "wagmi";
import { useSafeWallet } from "../context/SafeWalletContext";
import { ConnectWalletView } from "./ConnectWalletView";
import { WalletSelectionView } from "./WalletSelectionView";

interface AppContentProps {
  children: React.ReactNode;
}

export function AppContent({ children }: AppContentProps) {
  const { isConnected } = useAccount();
  const { selectedWallet, isLoading } = useSafeWallet();

  // Show loading state while checking localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary animate-pulse" />
          <p className="text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // Step 1: Not connected - show connect wallet view
  if (!isConnected) {
    return <ConnectWalletView />;
  }

  // Step 2: Connected but no wallet selected - show wallet selection
  if (!selectedWallet) {
    return <WalletSelectionView />;
  }

  // Step 3: Connected and wallet selected - show dashboard
  return <>{children}</>;
}
