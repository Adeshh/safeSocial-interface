interface OwnerCardProps {
  address: string;
  name?: string;
  isCurrentUser?: boolean;
  addedAt: string;
}

export function OwnerCard({ address, name, isCurrentUser, addedAt }: OwnerCardProps) {
  return (
    <div className="card p-5 flex items-center justify-between animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-bg-primary font-semibold">
          {name ? name.charAt(0).toUpperCase() : address.slice(2, 4).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            {name && <h3 className="font-medium text-text-primary">{name}</h3>}
            {isCurrentUser && (
              <span className="badge badge-info text-xs">You</span>
            )}
          </div>
          <p className="address">{address}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-text-muted">Added</p>
          <p className="text-sm text-text-secondary">{addedAt}</p>
        </div>
        <button className="btn-ghost p-2">
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
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </button>
      </div>
    </div>
  );
}
