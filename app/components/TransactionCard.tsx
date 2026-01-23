"use client";

import { useState } from "react";
import { type Address, type Hex } from "viem";
import { useAccount } from "wagmi";
import { useSignTransaction, useExecuteTransaction, useCancelTransaction } from "../hooks";
import { useSafeWallet } from "../context/SafeWalletContext";

interface TransactionCardProps {
  id: string;
  type: "transfer" | "contract" | "settings" | "TRANSFER" | "CONTRACT_CALL" | "ADD_OWNER" | "REMOVE_OWNER" | "CHANGE_THRESHOLD" | "CUSTOM";
  description: string | null;
  value?: string;
  to?: string;
  data?: Hex;
  nonce?: string;
  status: "pending" | "executed" | "rejected" | "PENDING" | "READY" | "EXECUTED" | "FAILED" | "CANCELLED";
  safeTxHash?: Hex;
  paymasterAndData?: Hex | null;
  signatures: {
    current: number;
    required: number;
    signers?: string[];
  };
  timestamp: string;
  onUpdate?: () => void;
}

export function TransactionCard({
  id,
  type,
  description,
  value,
  to,
  data,
  nonce,
  status,
  safeTxHash,
  paymasterAndData,
  signatures,
  timestamp,
  onUpdate,
}: TransactionCardProps) {
  const { address } = useAccount();
  const { selectedWallet } = useSafeWallet();
  const { signTransaction, isSigning, error: signError } = useSignTransaction();
  const { executeTransaction, isExecuting, error: execError } = useExecuteTransaction(
    selectedWallet?.address as Address | undefined
  );
  const { cancelTransaction, isCancelling, error: cancelError } = useCancelTransaction();
  const [localError, setLocalError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Normalize status
  const normalizedStatus = status.toLowerCase() as "pending" | "ready" | "executed" | "failed" | "cancelled";
  const isPending = normalizedStatus === "pending" || normalizedStatus === "ready";
  const isReady = normalizedStatus === "ready" || signatures.current >= signatures.required;

  // Check if current user has already signed
  const hasUserSigned = signatures.signers?.some(
    (signer) => signer.toLowerCase() === address?.toLowerCase()
  );

  const statusConfig = {
    pending: { badge: "badge-pending", label: "Pending" },
    ready: { badge: "badge-info", label: "Ready" },
    executed: { badge: "badge-success", label: "Executed" },
    failed: { badge: "badge-error", label: "Failed" },
    cancelled: { badge: "badge-error", label: "Cancelled" },
  };

  // Normalize type
  const normalizedType = type.toLowerCase().replace("_", "") as "transfer" | "contract" | "settings";
  const typeMapping: Record<string, "transfer" | "contract" | "settings"> = {
    transfer: "transfer",
    contractcall: "contract",
    addowner: "settings",
    removeowner: "settings",
    changethreshold: "settings",
    custom: "contract",
  };
  const mappedType = typeMapping[normalizedType] || "transfer";

  const typeIcons = {
    transfer: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-primary">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    contract: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-secondary">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14,2 14,8 20,8" />
        <path d="m10 13-2 2 2 2" />
        <path d="m14 17 2-2-2-2" />
      </svg>
    ),
    settings: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-status-pending">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  };

  const handleSign = async () => {
    if (!safeTxHash) {
      setLocalError("Transaction hash not available");
      return;
    }

    setLocalError(null);
    const success = await signTransaction(id, safeTxHash);
    if (success && onUpdate) {
      onUpdate();
    }
  };

  const handleExecute = async () => {
    if (!to || !nonce) {
      setLocalError("Transaction details not available");
      return;
    }

    setLocalError(null);
    const txHash = await executeTransaction(id, {
      to: to as Address,
      value: value || "0",
      data: data || "0x",
      nonce,
      paymasterAndData: paymasterAndData || undefined,
    });

    if (txHash && onUpdate) {
      onUpdate();
    }
  };

  const handleCancel = async () => {
    setLocalError(null);
    const success = await cancelTransaction(id);
    if (success && onUpdate) {
      setShowCancelConfirm(false);
      onUpdate();
    }
  };

  // Check if using paymaster
  const usesPaymaster = paymasterAndData && paymasterAndData !== "0x";

  const formatValue = (val: string) => {
    // If value is in wei, convert to ETH
    if (val.length > 10) {
      const eth = Number(val) / 1e18;
      return `${eth.toFixed(4)} ETH`;
    }
    return val;
  };

  return (
    <div className="card p-5 hover:border-border-accent animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-bg-tertiary">
            {typeIcons[mappedType]}
          </div>
          <div>
            <h3 className="font-medium text-text-primary mb-1">
              {description || "Transaction"}
            </h3>
            {to && (
              <p className="text-sm text-text-muted">
                To: <span className="address">{to.slice(0, 10)}...{to.slice(-8)}</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {usesPaymaster && (
            <span className="badge bg-accent-secondary/20 text-accent-secondary border-accent-secondary/30">
              DAI Gas
            </span>
          )}
          <span className={`badge ${statusConfig[normalizedStatus]?.badge || "badge-pending"}`}>
            {statusConfig[normalizedStatus]?.label || status}
          </span>
        </div>
      </div>

      {/* Error display */}
      {(localError || signError || execError || cancelError) && (
        <div className="mb-4 p-3 rounded-lg bg-status-error/10 border border-status-error/30">
          <p className="text-sm text-status-error">{localError || signError || execError || cancelError}</p>
        </div>
      )}

      {/* Cancel Confirmation */}
      {showCancelConfirm && (
        <div className="mb-4 p-4 rounded-lg bg-status-pending/10 border border-status-pending/30">
          <p className="text-sm text-text-primary mb-3">Are you sure you want to cancel this transaction?</p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="btn-secondary text-xs py-2 px-3"
              disabled={isCancelling}
            >
              No, keep it
            </button>
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="text-xs py-2 px-3 rounded-lg bg-status-error/20 text-status-error hover:bg-status-error/30 transition-colors disabled:opacity-50"
            >
              {isCancelling ? "Cancelling..." : "Yes, cancel"}
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
        <div className="flex items-center gap-6">
          {value && value !== "0" && (
            <div>
              <p className="text-xs text-text-muted mb-1">Value</p>
              <p className="font-semibold text-text-primary">{formatValue(value)}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-text-muted mb-1">Signatures</p>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {Array.from({ length: signatures.current }).map((_, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary border-2 border-bg-secondary"
                  />
                ))}
                {Array.from({ length: Math.max(0, signatures.required - signatures.current) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-bg-tertiary border-2 border-bg-secondary border-dashed"
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-text-secondary">
                {signatures.current}/{signatures.required}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted">{timestamp}</span>
          
          {isPending && !hasUserSigned && (
            <button 
              onClick={handleSign}
              disabled={isSigning}
              className="btn-primary text-xs py-2 px-4 disabled:opacity-50"
            >
              {isSigning ? "Signing..." : "Sign"}
            </button>
          )}
          
          {isPending && hasUserSigned && !isReady && (
            <span className="text-xs text-status-success">✓ Signed</span>
          )}
          
          {isReady && isPending && (
            <button 
              onClick={handleExecute}
              disabled={isExecuting}
              className="btn-primary text-xs py-2 px-4 disabled:opacity-50"
            >
              {isExecuting ? "Executing..." : "Execute"}
            </button>
          )}

          {/* Cancel button for pending transactions */}
          {isPending && !showCancelConfirm && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              disabled={isCancelling}
              className="text-xs py-2 px-3 rounded-lg bg-bg-tertiary text-text-muted hover:text-status-error hover:bg-status-error/10 transition-colors disabled:opacity-50"
              title="Cancel transaction"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
