"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function ConnectWalletView() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center mb-6">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-bg-primary">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-text-primary mb-3">SafeSocial</h1>
          <p className="text-lg text-text-secondary">
            Secure multi-signature wallet for managing shared funds with confidence
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="p-4 rounded-xl bg-bg-secondary border border-border-subtle">
            <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-accent-primary/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-primary">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <p className="text-sm text-text-secondary">Multi-sig Security</p>
          </div>
          <div className="p-4 rounded-xl bg-bg-secondary border border-border-subtle">
            <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-accent-secondary/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-secondary">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <p className="text-sm text-text-secondary">Team Managed</p>
          </div>
          <div className="p-4 rounded-xl bg-bg-secondary border border-border-subtle">
            <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-status-success/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-status-success">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <p className="text-sm text-text-secondary">On-chain Verified</p>
          </div>
        </div>

        {/* Connect Button */}
        <div className="card p-8">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Get Started</h2>
          <p className="text-text-secondary mb-6">
            Connect your wallet to view or create SafeSocial wallets
          </p>
          
          <ConnectButton.Custom>
            {({ openConnectModal, mounted }) => {
              const ready = mounted;
              return (
                <button
                  onClick={openConnectModal}
                  disabled={!ready}
                  className="btn-primary w-full py-4 text-base"
                >
                  <span className="flex items-center justify-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <path d="M22 10H18a2 2 0 0 0 0 4h4" />
                    </svg>
                    Connect Wallet
                  </span>
                </button>
              );
            }}
          </ConnectButton.Custom>
        </div>

        {/* Network Badge */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-status-pending animate-pulse" />
          <span className="text-sm text-text-muted">Sepolia Testnet</span>
        </div>
      </div>
    </div>
  );
}
