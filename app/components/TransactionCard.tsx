interface TransactionCardProps {
  id: string;
  type: "transfer" | "contract" | "settings";
  description: string;
  value?: string;
  to?: string;
  status: "pending" | "executed" | "rejected";
  signatures: {
    current: number;
    required: number;
  };
  timestamp: string;
}

export function TransactionCard({
  id,
  type,
  description,
  value,
  to,
  status,
  signatures,
  timestamp,
}: TransactionCardProps) {
  const statusConfig = {
    pending: {
      badge: "badge-pending",
      label: "Pending",
    },
    executed: {
      badge: "badge-success",
      label: "Executed",
    },
    rejected: {
      badge: "badge-error",
      label: "Rejected",
    },
  };

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

  return (
    <div className="card p-5 hover:border-border-accent animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-bg-tertiary">
            {typeIcons[type]}
          </div>
          <div>
            <h3 className="font-medium text-text-primary mb-1">{description}</h3>
            {to && (
              <p className="text-sm text-text-muted">
                To: <span className="address">{to}</span>
              </p>
            )}
          </div>
        </div>
        <span className={`badge ${statusConfig[status].badge}`}>
          {statusConfig[status].label}
        </span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
        <div className="flex items-center gap-6">
          {value && (
            <div>
              <p className="text-xs text-text-muted mb-1">Value</p>
              <p className="font-semibold text-text-primary">{value}</p>
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
                {Array.from({ length: signatures.required - signatures.current }).map((_, i) => (
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
          {status === "pending" && (
            <>
              <button className="btn-primary text-xs py-2 px-4">
                Sign
              </button>
              <button className="btn-ghost text-xs text-status-error hover:bg-status-error/10">
                Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
