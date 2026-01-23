"use client";

import { Sidebar, Header } from "../components";
import { AppContent } from "../components/AppContent";
import { useSafeWallet } from "../context/SafeWalletContext";

function SettingsContent() {
  const { selectedWallet } = useSafeWallet();

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
                      <button className="btn-secondary px-4">
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
                        Current: {selectedWallet?.threshold} of {selectedWallet?.owners} owners must sign
                      </p>
                    </div>
                    <button className="btn-secondary text-sm">
                      Change
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-bg-tertiary">
                    <div>
                      <h3 className="font-medium text-text-primary mb-1">
                        Transaction Expiry
                      </h3>
                      <p className="text-sm text-text-secondary">
                        Pending transactions expire after 7 days
                      </p>
                    </div>
                    <button className="btn-secondary text-sm">
                      Configure
                    </button>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-6">
                  Notifications
                </h2>
                <div className="space-y-4">
                  {[
                    { label: "New transaction proposals", description: "Get notified when a new transaction is proposed" },
                    { label: "Signature requests", description: "Receive alerts when your signature is needed" },
                    { label: "Transaction executions", description: "Know when transactions are executed" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-3">
                      <div>
                        <h3 className="font-medium text-text-primary">{item.label}</h3>
                        <p className="text-sm text-text-muted">{item.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-bg-elevated rounded-full peer peer-checked:bg-accent-primary transition-colors peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                      </label>
                    </div>
                  ))}
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
                    <span className="text-text-primary font-medium">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Created</span>
                    <span className="text-text-primary font-medium">{selectedWallet?.createdAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Owners</span>
                    <span className="text-text-primary font-medium">{selectedWallet?.owners}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Threshold</span>
                    <span className="text-text-primary font-medium">{selectedWallet?.threshold}</span>
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
                  <a
                    href="#"
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
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <path d="M12 17h.01" />
                    </svg>
                    <span className="text-text-secondary">Documentation</span>
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
                    // This will trigger the wallet selection view
                    localStorage.removeItem("selectedSafeWallet");
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
