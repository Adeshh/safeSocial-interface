"use client";

import { type ReactNode } from "react";
import { RainbowKitProvider, darkTheme, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sepolia } from "wagmi/chains";
import "@rainbow-me/rainbowkit/styles.css";

// Create config only on client side - Sepolia only for now
const config = getDefaultConfig({
  appName: "SafeSocial",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
  chains: [sepolia],
  ssr: false,
});

const queryClient = new QueryClient();

// Custom theme to match our design system
const customTheme = darkTheme({
  accentColor: "#00d4aa",
  accentColorForeground: "#0a0b0d",
  borderRadius: "large",
  fontStack: "system",
  overlayBlur: "small",
});

export function WalletProviders({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={{
            ...customTheme,
            colors: {
              ...customTheme.colors,
              modalBackground: "#12141a",
              modalBorder: "rgba(255, 255, 255, 0.06)",
              profileForeground: "#1a1d26",
              closeButton: "#9ca3af",
              closeButtonBackground: "#22262f",
              generalBorder: "rgba(255, 255, 255, 0.1)",
              connectButtonBackground: "#1a1d26",
              connectButtonBackgroundError: "#ef4444",
              connectButtonInnerBackground: "#22262f",
              connectButtonText: "#f4f5f6",
              connectButtonTextError: "#ffffff",
            },
          }}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
