"use client";

import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useSafeWallet, type SafeWallet } from "../context/SafeWalletContext";

// Mock data - will be replaced with database queries
const mockWallets: SafeWallet[] = [
  {
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f8bE2a",
    name: "Treasury Wallet",
    threshold: 2,
    owners: 3,
    balance: "5.25 ETH",
    createdAt: "Jan 15, 2026",
  },
  {
    address: "0xAbC123456789dEf0123456789AbCdEf012345678",
    name: "Development Fund",
    threshold: 3,
    owners: 5,
    balance: "12.8 ETH",
    createdAt: "Jan 10, 2026",
  },
];

export function WalletSelectionView() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { setSelectedWallet } = useSafeWallet();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWalletName, setNewWalletName] = useState("");

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleSelectWallet = (wallet: SafeWallet) => {
    setSelectedWallet(wallet);
  };

  const handleCreateWallet = () => {
    // Mock create - will be replaced with actual contract deployment
    const newWallet: SafeWallet = {
      address: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      name: newWalletName || "New SafeSocial Wallet",
      threshold: 1,
      owners: 1,
      balance: "0 ETH",
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    setSelectedWallet(newWallet);
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-bg-primary">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Select a Wallet</h1>
          <p className="text-text-secondary">
            Choose an existing SafeSocial wallet or create a new one
          </p>
        </div>

        {/* Connected Account */}
        <div className="card p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary" />
            <div>
              <p className="text-sm text-text-muted">Connected as</p>
              <p className="font-mono text-text-primary">{formatAddress(address || "")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-status-pending/10 text-status-pending text-sm">
              <div className="w-2 h-2 rounded-full bg-status-pending" />
              Sepolia
            </span>
            <button
              onClick={() => disconnect()}
              className="btn-ghost text-sm text-text-muted hover:text-status-error"
            >
              Disconnect
            </button>
          </div>
        </div>

        {/* Wallet List */}
        <div className="space-y-4 mb-6">
          <h2 className="text-lg font-semibold text-text-primary">Your Wallets</h2>
          
          {mockWallets.length > 0 ? (
            <div className="space-y-3">
              {mockWallets.map((wallet) => (
                <button
                  key={wallet.address}
                  onClick={() => handleSelectWallet(wallet)}
                  className="w-full card p-5 text-left hover:border-accent-primary/50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent-primary">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.3" />
                          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary mb-1">{wallet.name}</h3>
                        <p className="text-sm font-mono text-text-muted">{formatAddress(wallet.address)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-text-primary">{wallet.balance}</p>
                      <p className="text-sm text-text-muted">
                        {wallet.threshold}/{wallet.owners} signers
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bg-tertiary flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <path d="M22 10H18a2 2 0 0 0 0 4h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">No wallets found</h3>
              <p className="text-text-secondary">
                Create your first SafeSocial wallet to get started
              </p>
            </div>
          )}
        </div>

        {/* Create New Wallet Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full card p-5 border-dashed border-2 border-border-default hover:border-accent-primary/50 transition-all group"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bg-tertiary flex items-center justify-center group-hover:bg-accent-primary/10 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted group-hover:text-accent-primary transition-colors">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <span className="font-medium text-text-secondary group-hover:text-text-primary transition-colors">
              Create New SafeSocial Wallet
            </span>
          </div>
        </button>

        {/* View Any Wallet */}
        <div className="mt-8 pt-8 border-t border-border-subtle">
          <h3 className="text-sm font-medium text-text-muted mb-3">Or view any wallet by address</h3>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter SafeSocial wallet address (0x...)"
              className="input flex-1 font-mono text-sm"
            />
            <button className="btn-secondary px-6">
              View
            </button>
          </div>
        </div>
      </div>

      {/* Create Wallet Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative w-full max-w-md mx-4 card p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Create New Wallet
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-ghost p-2"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Wallet Name
                </label>
                <input
                  type="text"
                  value={newWalletName}
                  onChange={(e) => setNewWalletName(e.target.value)}
                  placeholder="e.g., Team Treasury"
                  className="input"
                />
              </div>

              <div className="p-4 rounded-xl bg-bg-tertiary">
                <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                  Initial Setup
                </div>
                <p className="text-sm text-text-muted">
                  You will be the first owner. You can add more owners and set the signature threshold after creation.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWallet}
                className="btn-primary flex-1"
              >
                Create Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
