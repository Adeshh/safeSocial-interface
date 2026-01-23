"use client";

import { useState } from "react";
import { type Address, type Hex, isAddress, getAddress, encodeFunctionData } from "viem";
import { useAccount } from "wagmi";
import { Sidebar, Header, OwnerCard } from "../components";
import { AppContent } from "../components/AppContent";
import { useSafeWallet } from "../context/SafeWalletContext";
import { useWalletDetails, useProposeTransaction } from "../hooks";
import { SAFE_SOCIAL_WALLET_ABI } from "../config/abis";

function OwnersContent() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChangeThresholdModal, setShowChangeThresholdModal] = useState(false);
  
  const { address: connectedAddress } = useAccount();
  const { selectedWallet } = useSafeWallet();
  const walletAddress = selectedWallet?.address as Address | undefined;
  
  const { details, isLoading, error, refetch } = useWalletDetails(walletAddress);

  // Format owner data for display
  const formatOwners = () => {
    if (!details?.owners) return [];
    
    return details.owners.map((ownerAddress) => ({
      address: ownerAddress,
      name: undefined, // Could be fetched from DB or ENS in the future
      isCurrentUser: ownerAddress.toLowerCase() === connectedAddress?.toLowerCase(),
      addedAt: "N/A", // Would need event indexing to track this
    }));
  };

  const owners = formatOwners();

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
                Owners
              </h1>
              <p className="text-text-secondary">
                Manage wallet owners and signing permissions
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
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
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" x2="19" y1="8" y2="14" />
                  <line x1="22" x2="16" y1="11" y2="11" />
                </svg>
                Add Owner
              </span>
            </button>
          </div>

          {/* Threshold Info */}
          <div className="card p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-accent-primary"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary mb-1">
                    Signature Threshold
                  </h2>
                  <p className="text-text-secondary">
                    Number of signatures required to execute transactions
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                {isLoading ? (
                  <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <div className="text-center">
                      <p className="text-4xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                        {details?.threshold || 0}
                      </p>
                      <p className="text-sm text-text-muted">Required</p>
                    </div>
                    <div className="text-2xl text-text-muted">/</div>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-text-primary">
                        {details?.owners.length || 0}
                      </p>
                      <p className="text-sm text-text-muted">Total Owners</p>
                    </div>
                  </>
                )}
                <button 
                  onClick={() => setShowChangeThresholdModal(true)}
                  className="btn-secondary ml-4"
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
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Change Threshold
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="card p-6 mb-8 border-status-error/30 bg-status-error/10">
              <p className="text-status-error">{error}</p>
              <button onClick={() => refetch()} className="btn-secondary mt-4">
                Retry
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="card p-12 text-center mb-8">
              <div className="w-8 h-8 mx-auto mb-4 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-text-secondary">Loading owners...</p>
            </div>
          )}

          {/* Owners List */}
          {!isLoading && !error && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Current Owners ({owners.length})
              </h3>
              {owners.length > 0 ? (
                <div className="space-y-4">
                  {owners.map((owner, index) => (
                    <div key={owner.address} style={{ animationDelay: `${index * 50}ms` }}>
                      <OwnerCard {...owner} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-12 text-center">
                  <p className="text-text-secondary">No owners found</p>
                </div>
              )}
            </div>
          )}

          {/* Owner Actions Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-status-info/10 flex items-center justify-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-status-info"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text-primary">Adding Owners</h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Adding a new owner requires approval from the current threshold of
                signers. Once the required signatures are collected, the new owner
                will be added automatically.
              </p>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-status-pending/10 flex items-center justify-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-status-pending"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text-primary">Removing Owners</h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Removing an owner also requires threshold approval. The threshold
                cannot exceed the number of remaining owners after removal.
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* Add Owner Modal */}
      {showAddModal && walletAddress && details && (
        <AddOwnerModal
          walletAddress={walletAddress}
          threshold={details.threshold}
          ownerCount={details.owners.length}
          currentOwners={details.owners}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            refetch();
          }}
        />
      )}

      {/* Change Threshold Modal */}
      {showChangeThresholdModal && walletAddress && details && (
        <ChangeThresholdModal
          walletAddress={walletAddress}
          currentThreshold={details.threshold}
          ownerCount={details.owners.length}
          onClose={() => setShowChangeThresholdModal(false)}
          onSuccess={() => {
            setShowChangeThresholdModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

// Add Owner Modal
function AddOwnerModal({
  walletAddress,
  threshold,
  ownerCount,
  currentOwners,
  onClose,
  onSuccess,
}: {
  walletAddress: Address;
  threshold: number;
  ownerCount: number;
  currentOwners: Address[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [newOwner, setNewOwner] = useState("");
  const [addressError, setAddressError] = useState<string | null>(null);
  const [usePaymaster, setUsePaymaster] = useState(false);
  
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
    if (currentOwners.some((o) => o.toLowerCase() === addr.toLowerCase())) {
      setAddressError("This address is already an owner");
      return false;
    }
    setAddressError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAddress(newOwner)) return;

    // Encode the addOwner function call
    const callData = encodeFunctionData({
      abi: SAFE_SOCIAL_WALLET_ABI,
      functionName: "addOwner",
      args: [getAddress(newOwner)],
    });

    const txId = await proposeTransaction({
      to: walletAddress, // Call to the wallet itself
      value: "0",
      data: callData,
      description: `Add owner: ${newOwner.slice(0, 10)}...${newOwner.slice(-8)}`,
      type: "ADD_OWNER",
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
      <div className="relative w-full max-w-md mx-4 card p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text-primary">
            Add New Owner
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Owner Address
            </label>
            <input
              type="text"
              value={newOwner}
              onChange={(e) => {
                setNewOwner(e.target.value);
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

          {error && (
            <div className="p-3 rounded-lg bg-status-error/10 border border-status-error/30">
              <p className="text-sm text-status-error">{error}</p>
            </div>
          )}

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
                <p className="font-medium text-text-primary text-sm">Pay gas with DAI</p>
                <p className="text-xs text-text-muted">Use SocialPaymaster for gas fees</p>
              </div>
              <span className="text-xs font-medium text-accent-secondary px-2 py-1 rounded bg-accent-secondary/20">DAI</span>
            </label>
          </div>

          <div className="p-4 rounded-xl bg-bg-tertiary">
            <div className="flex items-center gap-2 text-sm text-status-info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              This action requires {threshold} of {ownerCount} owner signatures
            </div>
          </div>

          <div className="flex gap-3">
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
              disabled={isProposing || !newOwner || !!addressError}
            >
              {isProposing ? "Proposing..." : "Propose Owner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Change Threshold Modal
function ChangeThresholdModal({
  walletAddress,
  currentThreshold,
  ownerCount,
  onClose,
  onSuccess,
}: {
  walletAddress: Address;
  currentThreshold: number;
  ownerCount: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [newThreshold, setNewThreshold] = useState(currentThreshold.toString());
  const [thresholdError, setThresholdError] = useState<string | null>(null);
  const [usePaymaster, setUsePaymaster] = useState(false);
  
  const { proposeTransaction, isProposing, error } = useProposeTransaction(walletAddress);

  const validateThreshold = (val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1) {
      setThresholdError("Threshold must be at least 1");
      return false;
    }
    if (num > ownerCount) {
      setThresholdError(`Threshold cannot exceed number of owners (${ownerCount})`);
      return false;
    }
    if (num === currentThreshold) {
      setThresholdError("New threshold must be different from current");
      return false;
    }
    setThresholdError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateThreshold(newThreshold)) return;

    // Encode the updateThreshould function call
    const callData = encodeFunctionData({
      abi: SAFE_SOCIAL_WALLET_ABI,
      functionName: "updateThreshould",
      args: [BigInt(newThreshold)],
    });

    const txId = await proposeTransaction({
      to: walletAddress,
      value: "0",
      data: callData,
      description: `Change threshold from ${currentThreshold} to ${newThreshold}`,
      type: "CHANGE_THRESHOLD",
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
      <div className="relative w-full max-w-md mx-4 card p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text-primary">
            Change Threshold
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              New Threshold
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  const val = Math.max(1, parseInt(newThreshold, 10) - 1);
                  setNewThreshold(val.toString());
                  validateThreshold(val.toString());
                }}
                className="btn-secondary p-3"
                disabled={parseInt(newThreshold, 10) <= 1}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" />
                </svg>
              </button>
              <input
                type="number"
                min="1"
                max={ownerCount}
                value={newThreshold}
                onChange={(e) => {
                  setNewThreshold(e.target.value);
                  validateThreshold(e.target.value);
                }}
                className={`input text-center text-2xl font-bold w-20 ${thresholdError ? "border-status-error" : ""}`}
                required
              />
              <button
                type="button"
                onClick={() => {
                  const val = Math.min(ownerCount, parseInt(newThreshold, 10) + 1);
                  setNewThreshold(val.toString());
                  validateThreshold(val.toString());
                }}
                className="btn-secondary p-3"
                disabled={parseInt(newThreshold, 10) >= ownerCount}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
            {thresholdError && (
              <p className="text-xs text-status-error mt-2 text-center">{thresholdError}</p>
            )}
            <p className="text-sm text-text-muted mt-2 text-center">
              out of {ownerCount} owner{ownerCount !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-bg-tertiary">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Current threshold:</span>
              <span className="font-medium text-text-primary">
                {currentThreshold} of {ownerCount}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-status-error/10 border border-status-error/30">
              <p className="text-sm text-status-error">{error}</p>
            </div>
          )}

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
                <p className="font-medium text-text-primary text-sm">Pay gas with DAI</p>
                <p className="text-xs text-text-muted">Use SocialPaymaster for gas fees</p>
              </div>
              <span className="text-xs font-medium text-accent-secondary px-2 py-1 rounded bg-accent-secondary/20">DAI</span>
            </label>
          </div>

          <div className="p-4 rounded-xl bg-bg-tertiary">
            <div className="flex items-center gap-2 text-sm text-status-info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              This action requires {currentThreshold} of {ownerCount} owner signatures
            </div>
          </div>

          <div className="flex gap-3">
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
              disabled={isProposing || !!thresholdError}
            >
              {isProposing ? "Proposing..." : "Propose Change"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OwnersPage() {
  return (
    <AppContent>
      <OwnersContent />
    </AppContent>
  );
}
