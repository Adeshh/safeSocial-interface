"use client";

import { useEffect } from "react";
import { type Address, formatEther } from "viem";
import { Sidebar, Header, StatCard, TransactionCard } from "./components";
import { AppContent } from "./components/AppContent";
import { useSafeWallet } from "./context/SafeWalletContext";
import { useWalletDetails, useTransactions } from "./hooks";

function DashboardContent() {
  const { selectedWallet, setSelectedWallet } = useSafeWallet();
  const { details, isLoading: detailsLoading, refetch: refetchDetails } = useWalletDetails(
    selectedWallet?.address as Address | undefined
  );
  const { transactions, isLoading: txLoading, refetch: refetchTransactions } = useTransactions(
    selectedWallet?.address as Address | undefined
  );

  // Update selected wallet with on-chain data
  useEffect(() => {
    if (details && selectedWallet) {
      setSelectedWallet({
        ...selectedWallet,
        threshold: details.threshold,
        owners: details.owners.length,
        balance: `${parseFloat(details.balance).toFixed(4)} ETH`,
      });
    }
  }, [details]);

  const pendingTransactions = transactions.filter(
    (tx) => tx.status === "PENDING" || tx.status === "READY"
  );

  const mockStats = [
    {
      title: "Total Balance",
      value: details?.balance ? `${parseFloat(details.balance).toFixed(4)} ETH` : "Loading...",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-primary">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      title: "Pending Transactions",
      value: pendingTransactions.length.toString(),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-status-pending">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      title: "Total Transactions",
      value: transactions.length.toString(),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-secondary">
          <path d="M17 3L21 7L17 11" />
          <path d="M21 7H9" />
          <path d="M7 21L3 17L7 13" />
          <path d="M3 17H15" />
        </svg>
      ),
    },
    {
      title: "Owners",
      value: details?.owners.length.toString() || "0",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-status-info">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ];

  const handleTransactionUpdate = () => {
    refetchTransactions();
    refetchDetails();
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <Header />
        
        <main className="p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Welcome back
            </h1>
            <p className="text-text-secondary">
              Managing <span className="text-accent-primary font-medium">{selectedWallet?.name}</span> on Sepolia Testnet
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {mockStats.map((stat, index) => (
              <div key={stat.title} style={{ animationDelay: `${index * 100}ms` }}>
                <StatCard {...stat} />
              </div>
            ))}
          </div>

          {/* Wallet Info Card */}
          <div className="card p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-1">
                  SafeSocial Multisig Wallet
                </h2>
                <p className="text-sm text-text-secondary">
                  Your multisig contract address on Sepolia
                </p>
              </div>
              <button 
                onClick={() => navigator.clipboard.writeText(selectedWallet?.address || "")}
                className="btn-secondary text-sm py-2"
              >
                <span className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy
                </span>
              </button>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-bg-tertiary">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-bg-primary">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-mono text-lg text-text-primary break-all">
                  {selectedWallet?.address || "0x..."}
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-text-muted">
                    Threshold: {details?.threshold || selectedWallet?.threshold || 0} of {details?.owners.length || selectedWallet?.owners || 0} signatures required
                  </span>
                  <span className="text-sm text-text-muted">•</span>
                  <span className="text-sm text-text-muted">
                    Nonce: {details?.nonce?.toString() || "0"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Transactions Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-text-primary mb-1">
                  Pending Transactions
                </h2>
                <p className="text-sm text-text-secondary">
                  Transactions awaiting signatures
                </p>
              </div>
              <a href="/transactions" className="btn-primary text-sm">
                <span className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  New Transaction
                </span>
              </a>
            </div>
            
            {txLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="card p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl skeleton" />
                      <div className="flex-1">
                        <div className="h-5 w-48 skeleton mb-2" />
                        <div className="h-4 w-32 skeleton" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : pendingTransactions.length > 0 ? (
              <div className="space-y-4">
                {pendingTransactions.slice(0, 5).map((tx, index) => (
                  <div key={tx.id} style={{ animationDelay: `${index * 100}ms` }}>
                    <TransactionCard
                      id={tx.id}
                      type={tx.type as any}
                      description={tx.description}
                      value={tx.value}
                      to={tx.to}
                      data={tx.data}
                      nonce={tx.nonce}
                      status={tx.status as any}
                      safeTxHash={tx.safeTxHash}
                      signatures={{
                        current: tx.signatureCount,
                        required: tx.threshold,
                        signers: tx.signatures.map(s => s.signerAddress),
                      }}
                      timestamp={new Date(tx.createdAt).toLocaleDateString()}
                      onUpdate={handleTransactionUpdate}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bg-tertiary flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">All caught up!</h3>
                <p className="text-text-secondary">No pending transactions</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="/transactions?new=true" className="card p-6 text-left hover:border-accent-primary/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary/20 to-accent-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-primary">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Send Tokens</h3>
              <p className="text-sm text-text-secondary">Transfer ETH or ERC-20 tokens</p>
            </a>

            <a href="/transactions?new=true&type=contract" className="card p-6 text-left hover:border-accent-secondary/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-secondary/20 to-accent-secondary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-secondary">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14,2 14,8 20,8" />
                  <path d="m10 13-2 2 2 2" />
                  <path d="m14 17 2-2-2-2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Contract Interaction</h3>
              <p className="text-sm text-text-secondary">Execute smart contract calls</p>
            </a>

            <a href="/owners?add=true" className="card p-6 text-left hover:border-status-info/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-status-info/20 to-status-info/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-status-info">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" x2="19" y1="8" y2="14" />
                  <line x1="22" x2="16" y1="11" y2="11" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Add Owner</h3>
              <p className="text-sm text-text-secondary">Propose a new signer</p>
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AppContent>
      <DashboardContent />
    </AppContent>
  );
}
