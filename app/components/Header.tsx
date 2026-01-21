"use client";

import { useState } from "react";

export function Header() {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <header className="sticky top-0 z-40 glass">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
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
              placeholder="Search transactions, addresses..."
              className="input pl-10 py-2.5 text-sm bg-bg-tertiary/50"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Network indicator */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-tertiary">
            <div className="w-2 h-2 rounded-full bg-accent-primary" />
            <span className="text-sm font-medium text-text-secondary">Ethereum</span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-bg-tertiary transition-colors">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-text-secondary"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-status-error rounded-full" />
          </button>

          {/* Connect Wallet Button */}
          {isConnected ? (
            <button
              onClick={() => setIsConnected(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-tertiary border border-border-default hover:border-border-accent transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary" />
              <span className="text-sm font-medium text-text-primary">0x1234...5678</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-text-muted"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => setIsConnected(true)}
              className="btn-primary text-sm py-2.5"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
