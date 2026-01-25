"use client";

import { useState } from "react";
import { type Address, type Hex, isAddress, getAddress, encodeFunctionData } from "viem";
import { Sidebar, Header, TransactionCard } from "../components";
import { AppContent } from "../components/AppContent";
import { useSafeWallet } from "../context/SafeWalletContext";
import { useTransactions, useProposeTransaction, useWalletDetails } from "../hooks";

type Tab = "pending" | "history" | "all";

function TransactionsContent() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewTxModal, setShowNewTxModal] = useState(false);
  
  const { selectedWallet } = useSafeWallet();
  const walletAddress = selectedWallet?.address as Address | undefined;
  
  const { transactions, isLoading, error, refetch } = useTransactions(walletAddress);
  const { details } = useWalletDetails(walletAddress);

  // Filter transactions based on tab
  const getTransactions = () => {
    let filtered = transactions;
    
    switch (activeTab) {
      case "pending":
        filtered = transactions.filter(
          (tx) => tx.status === "PENDING" || tx.status === "READY"
        );
        break;
      case "history":
        filtered = transactions.filter(
          (tx) => tx.status === "EXECUTED" || tx.status === "FAILED" || tx.status === "CANCELLED"
        );
        break;
      case "all":
      default:
        break;
    }

    if (searchQuery) {
      return filtered.filter(
        (tx) =>
          tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.to?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  };

  const pendingCount = transactions.filter(
    (tx) => tx.status === "PENDING" || tx.status === "READY"
  ).length;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "pending", label: "Pending", count: pendingCount },
    { id: "history", label: "History" },
    { id: "all", label: "All Transactions" },
  ];

  // Format transaction for TransactionCard
  const formatTransaction = (tx: typeof transactions[0]) => {
    const signers = tx.signatures?.map((s) => s.signerAddress) || [];
    
    return {
      id: tx.id,
      type: tx.type as "TRANSFER" | "CONTRACT_CALL" | "ADD_OWNER" | "REMOVE_OWNER" | "CHANGE_THRESHOLD" | "CUSTOM",
      description: tx.description,
      value: tx.value,
      to: tx.to,
      data: tx.data,
      nonce: tx.nonce,
      status: tx.status as "PENDING" | "READY" | "EXECUTED" | "FAILED" | "CANCELLED",
      safeTxHash: tx.userOpHash,
      paymasterAndData: tx.paymasterAndData,
      executionTxHash: tx.executionTxHash,
      signatures: {
        current: tx.signatureCount,
        required: tx.threshold,
        signers,
      },
      timestamp: formatTimestamp(tx.createdAt),
      onUpdate: refetch,
    };
  };

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString();
  };

  const displayedTransactions = getTransactions();

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-64">
        <Header />

        <main className="p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Transactions
              </h1>
              <p className="text-text-secondary">
                Manage and track all wallet transactions
              </p>
            </div>
            <button 
              onClick={() => setShowNewTxModal(true)}
              className="btn-primary"
            >
              <span className="flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                New Transaction
              </span>
            </button>
          </div>

          {/* Tabs and Search */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-bg-secondary">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-bg-tertiary text-text-primary"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        activeTab === tab.id
                          ? "bg-accent-primary/20 text-accent-primary"
                          : "bg-bg-elevated text-text-muted"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="relative w-80">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input w-full pl-11 py-2.5 text-sm"
              />
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="card p-12 text-center">
              <div className="w-8 h-8 mx-auto mb-4 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-text-secondary">Loading transactions...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="card p-6 border-status-error/30 bg-status-error/10">
              <p className="text-status-error">{error}</p>
              <button onClick={() => refetch()} className="btn-secondary mt-4">
                Retry
              </button>
            </div>
          )}

          {/* Transaction List */}
          {!isLoading && !error && (
            <div className="space-y-4">
              {displayedTransactions.length > 0 ? (
                displayedTransactions.map((tx, index) => (
                  <div key={tx.id} style={{ animationDelay: `${index * 50}ms` }}>
                    <TransactionCard {...formatTransaction(tx)} />
                  </div>
                ))
              ) : (
                <div className="card p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bg-tertiary flex items-center justify-center">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-text-muted"
                    >
                      <path d="M17 3L21 7L17 11" />
                      <path d="M21 7H9" />
                      <path d="M7 21L3 17L7 13" />
                      <path d="M3 17H15" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    No transactions found
                  </h3>
                  <p className="text-text-secondary mb-6">
                    {searchQuery
                      ? "Try adjusting your search query"
                      : activeTab === "pending"
                      ? "No pending transactions"
                      : "Create your first transaction to get started"}
                  </p>
                  {!searchQuery && activeTab === "pending" && (
                    <button 
                      onClick={() => setShowNewTxModal(true)}
                      className="btn-primary mx-auto"
                    >
                      Create Transaction
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* New Transaction Modal */}
      {showNewTxModal && (
        <NewTransactionModal
          walletAddress={walletAddress}
          threshold={details?.threshold || selectedWallet?.threshold || 1}
          owners={details?.owners.length || selectedWallet?.owners || 1}
          onClose={() => setShowNewTxModal(false)}
          onSuccess={() => {
            setShowNewTxModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

// New Transaction Modal Component
function NewTransactionModal({
  walletAddress,
  threshold,
  owners,
  onClose,
  onSuccess,
}: {
  walletAddress: Address | undefined;
  threshold: number;
  owners: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [txType, setTxType] = useState<"transfer" | "contract">("transfer");
  const [to, setTo] = useState("");
  const [value, setValue] = useState("");
  const [data, setData] = useState("");
  const [description, setDescription] = useState("");
  const [addressError, setAddressError] = useState<string | null>(null);
  const [usePaymaster, setUsePaymaster] = useState(false);
  
  // Contract call specific state
  const [abiInput, setAbiInput] = useState("");
  const [parsedFunctions, setParsedFunctions] = useState<Array<{ name: string; inputs: Array<{ name: string; type: string }> }>>([]);
  const [selectedFunction, setSelectedFunction] = useState<string>("");
  const [functionParams, setFunctionParams] = useState<Record<string, string>>({});
  const [abiError, setAbiError] = useState<string | null>(null);
  
  const { proposeTransaction, isProposing, error } = useProposeTransaction(walletAddress);

  const validateAddress = (addr: string) => {
    if (!addr) {
      setAddressError(null);
      return false;
    }
    if (!isAddress(addr)) {
      setAddressError("Invalid Ethereum address");
      return false;
    }
    setAddressError(null);
    return true;
  };

  // Parse ABI and extract functions
  const parseAbi = (abiString: string) => {
    setAbiError(null);
    setParsedFunctions([]);
    setSelectedFunction("");
    setFunctionParams({});
    
    if (!abiString.trim()) return;
    
    try {
      const parsed = JSON.parse(abiString);
      const abi = Array.isArray(parsed) ? parsed : [parsed];
      
      // Extract writable functions (not view/pure)
      const functions = abi
        .filter((item: { type?: string; stateMutability?: string; name?: string }) => 
          item.type === "function" && 
          item.stateMutability !== "view" && 
          item.stateMutability !== "pure"
        )
        .map((item: { name: string; inputs: Array<{ name: string; type: string }> }) => ({
          name: item.name,
          inputs: item.inputs || [],
        }));
      
      if (functions.length === 0) {
        setAbiError("No writable functions found in ABI");
        return;
      }
      
      setParsedFunctions(functions);
    } catch {
      setAbiError("Invalid ABI format. Please paste a valid JSON ABI.");
    }
  };

  // Generate calldata from selected function and params
  const generateCalldata = (): Hex | null => {
    if (!selectedFunction || parsedFunctions.length === 0) return null;
    
    const func = parsedFunctions.find(f => f.name === selectedFunction);
    if (!func) return null;
    
    try {
      // Build the function signature
      const inputTypes = func.inputs.map(i => i.type).join(",");
      const signature = `function ${func.name}(${inputTypes})`;
      
      // Parse values based on types
      const args = func.inputs.map(input => {
        const value = functionParams[input.name] || "";
        
        // Handle different types
        if (input.type.startsWith("uint") || input.type.startsWith("int")) {
          return BigInt(value || "0");
        }
        if (input.type === "bool") {
          return value.toLowerCase() === "true";
        }
        if (input.type === "address") {
          return value as Address;
        }
        if (input.type.endsWith("[]")) {
          try {
            return JSON.parse(value || "[]");
          } catch {
            return [];
          }
        }
        return value;
      });
      
      const callData = encodeFunctionData({
        abi: [{ type: "function", name: func.name, inputs: func.inputs, outputs: [], stateMutability: "nonpayable" }],
        functionName: func.name,
        args,
      });
      
      return callData;
    } catch (err) {
      console.error("Failed to encode function data:", err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAddress(to)) return;

    let callData: Hex | undefined;
    
    if (txType === "contract") {
      if (selectedFunction) {
        // Generate from ABI
        callData = generateCalldata() || undefined;
      } else if (data) {
        // Use raw calldata if provided
        callData = data as Hex;
      }
    }

    const txId = await proposeTransaction({
      to: getAddress(to),
      value: value || "0",
      data: callData,
      description: description || (txType === "transfer" ? "ETH Transfer" : `${selectedFunction || "Contract"} Call`),
      type: txType === "transfer" ? "TRANSFER" : "CONTRACT_CALL",
      usePaymaster,
    });

    if (txId) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg mx-4 card p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text-primary">
            New Transaction
          </h2>
          <button onClick={onClose} className="btn-ghost p-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Transaction Type Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setTxType("transfer")}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
              txType === "transfer"
                ? "bg-accent-primary/20 text-accent-primary border border-accent-primary/30"
                : "bg-bg-tertiary text-text-secondary hover:text-text-primary"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Transfer
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTxType("contract")}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
              txType === "contract"
                ? "bg-accent-primary/20 text-accent-primary border border-accent-primary/30"
                : "bg-bg-tertiary text-text-secondary hover:text-text-primary"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14,2 14,8 20,8" />
              </svg>
              Contract Call
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {txType === "contract" ? "Contract Address" : "Recipient Address"}
            </label>
            <input
              type="text"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                validateAddress(e.target.value);
              }}
              placeholder="0x..."
              className={`input font-mono ${addressError ? "border-status-error" : ""}`}
              required
            />
            {addressError && (
              <p className="text-xs text-status-error mt-1">{addressError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Amount (ETH)
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0.0"
              className="input"
            />
          </div>

          {txType === "contract" && (
            <>
              {/* ABI Input */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Contract ABI
                </label>
                <textarea
                  value={abiInput}
                  onChange={(e) => {
                    setAbiInput(e.target.value);
                    parseAbi(e.target.value);
                  }}
                  placeholder='Paste contract ABI here (JSON format)...'
                  className={`input font-mono text-xs h-24 resize-none ${abiError ? "border-status-error" : ""}`}
                />
                {abiError && (
                  <p className="text-xs text-status-error mt-1">{abiError}</p>
                )}
                {parsedFunctions.length > 0 && (
                  <p className="text-xs text-status-success mt-1">
                    Found {parsedFunctions.length} writable function{parsedFunctions.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {/* Function Selector */}
              {parsedFunctions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Function
                  </label>
                  <select
                    value={selectedFunction}
                    onChange={(e) => {
                      setSelectedFunction(e.target.value);
                      setFunctionParams({});
                    }}
                    className="input"
                  >
                    <option value="">Select a function...</option>
                    {parsedFunctions.map((func) => (
                      <option key={func.name} value={func.name}>
                        {func.name}({func.inputs.map(i => `${i.type} ${i.name}`).join(", ")})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Function Parameters */}
              {selectedFunction && parsedFunctions.find(f => f.name === selectedFunction)?.inputs.map((input) => (
                <div key={input.name}>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    {input.name} <span className="text-text-muted">({input.type})</span>
                  </label>
                  <input
                    type="text"
                    value={functionParams[input.name] || ""}
                    onChange={(e) => setFunctionParams(prev => ({ ...prev, [input.name]: e.target.value }))}
                    placeholder={input.type === "address" ? "0x..." : input.type.includes("int") ? "0" : ""}
                    className="input font-mono"
                  />
                </div>
              ))}

              {/* Fallback: Raw Calldata */}
              {parsedFunctions.length === 0 && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Raw Calldata (hex) <span className="text-text-muted text-xs">- or paste ABI above</span>
                  </label>
                  <textarea
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    placeholder="0x..."
                    className="input font-mono text-sm h-20 resize-none"
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this transaction for?"
              className="input"
            />
          </div>

          {/* Paymaster Option */}
          <div className="p-4 rounded-xl bg-bg-tertiary">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={usePaymaster}
                onChange={(e) => setUsePaymaster(e.target.checked)}
                className="w-5 h-5 rounded border-border-default bg-bg-elevated text-accent-primary focus:ring-accent-primary focus:ring-offset-0"
              />
              <div className="flex-1">
                <p className="font-medium text-text-primary">Pay gas with DAI</p>
                <p className="text-xs text-text-muted">
                  Use SocialPaymaster to pay gas fees in DAI tokens instead of ETH
                </p>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-accent-secondary/20">
                <span className="text-xs font-medium text-accent-secondary">DAI</span>
              </div>
            </label>
            {usePaymaster && (
              <div className="mt-3 p-3 rounded-lg bg-status-pending/10 border border-status-pending/30">
                <div className="flex items-start gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-status-pending mt-0.5 shrink-0">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <p className="text-xs text-status-pending">
                    Ensure your wallet has DAI tokens and has approved the Paymaster contract to spend them.
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-status-error/10 border border-status-error/30">
              <p className="text-sm text-status-error">{error}</p>
            </div>
          )}

          <div className="p-4 rounded-xl bg-bg-tertiary">
            <div className="flex items-center gap-2 text-sm text-status-info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              This transaction requires {threshold} of {owners} owner signatures
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={isProposing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={isProposing || !to}
            >
              {isProposing ? "Proposing..." : "Propose Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <AppContent>
      <TransactionsContent />
    </AppContent>
  );
}
