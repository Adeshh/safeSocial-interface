"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { SafeWalletProvider } from "./context/SafeWalletContext";

// Dynamically import the wallet providers with no SSR
const WalletProviders = dynamic(
  () => import("./components/WalletProviders").then((mod) => mod.WalletProviders),
  {
    ssr: false,
    loading: () => null,
  }
);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WalletProviders>
      <SafeWalletProvider>{children}</SafeWalletProvider>
    </WalletProviders>
  );
}
