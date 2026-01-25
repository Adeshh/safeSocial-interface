"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  return (
    <header className="sticky top-0 z-40 glass">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              width="16"
              height="16"
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
              className="input w-full pl-11 py-2.5 text-sm bg-bg-tertiary/50"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
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

          {/* RainbowKit Connect Button */}
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              return (
                <div
                  {...(!ready && {
                    "aria-hidden": true,
                    style: {
                      opacity: 0,
                      pointerEvents: "none",
                      userSelect: "none",
                    },
                  })}
                  className="flex items-center gap-3"
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <button
                          onClick={openConnectModal}
                          className="btn-primary text-sm py-2.5"
                        >
                          Connect Wallet
                        </button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <button
                          onClick={openChainModal}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-status-error/20 border border-status-error/30 text-status-error font-medium"
                        >
                          Wrong network
                        </button>
                      );
                    }

                    return (
                      <>
                        {/* Network selector */}
                        <button
                          onClick={openChainModal}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-tertiary hover:bg-bg-elevated transition-colors"
                        >
                          {chain.hasIcon && (
                            <div
                              className="w-5 h-5 rounded-full overflow-hidden"
                              style={{ background: chain.iconBackground }}
                            >
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? "Chain icon"}
                                  src={chain.iconUrl}
                                  className="w-5 h-5"
                                />
                              )}
                            </div>
                          )}
                          <span className="text-sm font-medium text-text-secondary">
                            {chain.name}
                          </span>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-text-muted"
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </button>

                        {/* Account button */}
                        <button
                          onClick={openAccountModal}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-tertiary border border-border-default hover:border-border-accent transition-all"
                        >
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary" />
                          <span className="text-sm font-medium text-text-primary">
                            {account.displayName}
                          </span>
                          {account.displayBalance && (
                            <span className="text-sm text-text-muted">
                              ({account.displayBalance})
                            </span>
                          )}
                        </button>
                      </>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </header>
  );
}
