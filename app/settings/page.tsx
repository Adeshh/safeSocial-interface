"use client";

import { useState } from "react";
import { type Address, formatEther, parseEther } from "viem";
import { useWalletClient, usePublicClient } from "wagmi";
import { Sidebar, Header } from "../components";
import { AppContent } from "../components/AppContent";
import { useSafeWallet } from "../context/SafeWalletContext";
import { useEntryPointDeposit, useWalletDetails } from "../hooks";
import { CONTRACTS } from "../config/contracts";

function SettingsContent() {
  const { selectedWallet, clearSelectedWallet } = useSafeWallet();
  const walletAddress = selectedWallet?.address as Address | undefined;
  
  const { details, refetch: refetchDetails } = useWalletDetails(walletAddress);
  const { balance: depositBalance, refetch: refetchDeposit } = useEntryPointDeposit(walletAddress);
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  
  const [fundAmount, setFundAmount] = useState("0.05");
  const [showFundModal, setShowFundModal] = useState(false);
  const [isFunding, setIsFunding] = useState(false);

  // Fund the SafeSocial wallet with ETH (for gas payments)
  const handleFundWallet = async () => {
    if (!walletAddress || !walletClient || !publicClient) return;
    
    setIsFunding(true);
    try {
      // Send ETH directly to the SafeSocial wallet
      const hash = await walletClient.sendTransaction({
        to: walletAddress,
        value: parseEther(fundAmount),
      });
      
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Refresh balances
      refetchDetails();
      refetchDeposit();
      setShowFundModal(false);
      setFundAmount("0.05");
    } catch (err) {
      console.error("Failed to fund wallet:", err);
    } finally {
      setIsFunding(false);
    }
  };

  const formattedDeposit = depositBalance ? formatEther(BigInt(depositBalance)) : "0";

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-64">
        <Header />

        <main className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Settings
            </h1>
            <p className="text-text-secondary">
              Configure your wallet preferences and security settings
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Wallet Balance - CRITICAL for gas payments */}
              <div className="card p-6 border-accent-primary/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-primary">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">
                      Wallet Balance
                    </h2>
                    <p className="text-sm text-text-secondary">
                      ETH for gas payments (auto-prefunded to EntryPoint)
                    </p>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-bg-tertiary mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-muted mb-1">Wallet ETH Balance</p>
                      <p className="text-2xl font-bold text-text-primary">
                        {details ? parseFloat(details.balance).toFixed(6) : "0.000000"} ETH
                      </p>
                    </div>
                    <button
                      onClick={() => setShowFundModal(true)}
                      className="btn-primary"
                    >
                      Fund Wallet
                    </button>
                  </div>
                </div>

                {/* EntryPoint deposit info (informational) */}
                <div className="p-3 rounded-lg bg-bg-tertiary mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">EntryPoint Deposit</span>
                    <span className="text-text-primary font-medium">
                      {parseFloat(formattedDeposit).toFixed(6)} ETH
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-status-info/10 border border-status-info/30">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-status-info mt-0.5 shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                  <p className="text-sm text-status-info">
                    Send ETH to your SafeSocial wallet. The wallet automatically pays gas from its balance 
                    via the EntryPoint during transaction execution. No manual deposit required.
                  </p>
                </div>
              </div>

              {/* Wallet Info */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-6">
                  Wallet Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Wallet Name
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedWallet?.name || "SafeSocial Wallet"}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Contract Address
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={selectedWallet?.address || "0x..."}
                        readOnly
                        className="input font-mono flex-1 bg-bg-elevated cursor-not-allowed"
                      />
                      <button 
                        onClick={() => navigator.clipboard.writeText(selectedWallet?.address || "")}
                        className="btn-secondary px-4"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-6">
                  Security Settings
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-bg-tertiary">
                    <div>
                      <h3 className="font-medium text-text-primary mb-1">
                        Signature Threshold
                      </h3>
                      <p className="text-sm text-text-secondary">
                        Current: {details?.threshold || selectedWallet?.threshold || 0} of {details?.owners.length || selectedWallet?.owners || 0} owners must sign
                      </p>
                    </div>
                    <a href="/owners" className="btn-secondary text-sm">
                      Manage
                    </a>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-bg-tertiary">
                    <div>
                      <h3 className="font-medium text-text-primary mb-1">
                        EntryPoint Contract
                      </h3>
                      <p className="text-sm text-text-secondary font-mono">
                        {CONTRACTS.ENTRY_POINT.slice(0, 10)}...{CONTRACTS.ENTRY_POINT.slice(-8)}
                      </p>
                    </div>
                    <a
                      href={`https://sepolia.etherscan.io/address/${CONTRACTS.ENTRY_POINT}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-sm"
                    >
                      View
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Network Info */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  Network
                </h2>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-bg-tertiary">
                  <div className="w-10 h-10 rounded-full bg-status-pending/20 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-status-pending">
                      <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">Sepolia Testnet</p>
                    <p className="text-sm text-text-muted">Chain ID: 11155111</p>
                  </div>
                </div>
              </div>

              {/* Contract Info */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  Contract Details
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Version</span>
                    <span className="text-text-primary font-medium">ERC-4337 v0.7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Owners</span>
                    <span className="text-text-primary font-medium">{details?.owners.length || selectedWallet?.owners || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Threshold</span>
                    <span className="text-text-primary font-medium">{details?.threshold || selectedWallet?.threshold || 0}</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  Quick Links
                </h2>
                <div className="space-y-2">
                  <a
                    href={`https://sepolia.etherscan.io/address/${selectedWallet?.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-tertiary transition-colors"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-text-muted"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    <span className="text-text-secondary">View on Etherscan</span>
                  </a>
                </div>
              </div>

              {/* Switch Wallet */}
              <div className="card p-6 border-accent-primary/20">
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  Switch Wallet
                </h2>
                <p className="text-sm text-text-muted mb-4">
                  Select a different SafeSocial wallet to manage.
                </p>
                <button
                  onClick={() => {
                    clearSelectedWallet();
                    window.location.reload();
                  }}
                  className="w-full btn-secondary"
                >
                  Change Wallet
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Fund Wallet Modal */}
      {showFundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowFundModal(false)}
          />
          <div className="relative w-full max-w-md mx-4 card p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Fund SafeSocial Wallet
              </h2>
              <button onClick={() => setShowFundModal(false)} className="btn-ghost p-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Amount (ETH)
                </label>
                <input
                  type="text"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="0.05"
                  className="input"
                />
              </div>
              
              <div className="flex gap-2">
                {["0.01", "0.05", "0.1"].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setFundAmount(amount)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      fundAmount === amount
                        ? "bg-accent-primary/20 text-accent-primary border border-accent-primary/30"
                        : "bg-bg-tertiary text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {amount} ETH
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-bg-tertiary mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-muted">Current Balance</span>
                <span className="text-text-primary">{details ? parseFloat(details.balance).toFixed(6) : "0"} ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">After Funding</span>
                <span className="text-accent-primary font-medium">
                  {(parseFloat(details?.balance || "0") + parseFloat(fundAmount || "0")).toFixed(6)} ETH
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-bg-tertiary mb-6">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted mt-0.5 shrink-0">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <p className="text-xs text-text-muted">
                ETH will be sent from your connected wallet to the SafeSocial wallet. 
                The wallet uses this balance to automatically pay for gas during transactions.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFundModal(false)}
                className="btn-secondary flex-1"
                disabled={isFunding}
              >
                Cancel
              </button>
              <button
                onClick={handleFundWallet}
                className="btn-primary flex-1"
                disabled={isFunding || !fundAmount}
              >
                {isFunding ? "Sending..." : "Send ETH"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AppContent>
      <SettingsContent />
    </AppContent>
  );
}
