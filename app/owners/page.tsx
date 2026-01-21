"use client";

import { useState } from "react";
import { Sidebar, Header, OwnerCard } from "../components";

// Mock data
const mockOwners = [
  {
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f8bE2a",
    name: "Treasury Admin",
    isCurrentUser: true,
    addedAt: "Jan 15, 2026",
  },
  {
    address: "0xAbC123456789dEf0123456789AbCdEf012345678",
    name: "Alice Johnson",
    addedAt: "Jan 15, 2026",
  },
  {
    address: "0x9D23456789AbCdEf0123456789AbCdEf01234567",
    name: "Bob Smith",
    addedAt: "Jan 18, 2026",
  },
  {
    address: "0x3F45678901234567890AbCdEf0123456789AbCdEf",
    name: undefined,
    addedAt: "Jan 20, 2026",
  },
  {
    address: "0x7A25678901234567890AbCdEf0123456789AbCdEf",
    name: "Charlie Dev",
    addedAt: "Jan 21, 2026",
  },
];

export default function OwnersPage() {
  const [showAddModal, setShowAddModal] = useState(false);

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
                <div className="text-center">
                  <p className="text-4xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                    3
                  </p>
                  <p className="text-sm text-text-muted">Required</p>
                </div>
                <div className="text-2xl text-text-muted">/</div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-text-primary">5</p>
                  <p className="text-sm text-text-muted">Total Owners</p>
                </div>
                <button className="btn-secondary ml-4">
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

          {/* Owners List */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Current Owners ({mockOwners.length})
            </h3>
            <div className="space-y-4">
              {mockOwners.map((owner, index) => (
                <div key={owner.address} style={{ animationDelay: `${index * 50}ms` }}>
                  <OwnerCard {...owner} />
                </div>
              ))}
            </div>
          </div>

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
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative w-full max-w-md mx-4 card p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Add New Owner
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-ghost p-2"
              >
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

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Owner Address
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  className="input font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter a name for this owner"
                  className="input"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-bg-tertiary mb-6">
              <div className="flex items-center gap-2 text-sm text-status-info">
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
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                This action requires 3 of 5 owner signatures
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button className="btn-primary flex-1">Propose Owner</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
