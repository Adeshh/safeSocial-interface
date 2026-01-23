"use client";

import { useState } from "react";
import { Sidebar, Header, TransactionCard } from "../components";
import { AppContent } from "../components/AppContent";

// Mock data
const mockTransactions = {
  pending: [
    {
      id: "tx-001",
      type: "transfer" as const,
      description: "Transfer to Development Fund",
      value: "0.5 ETH",
      to: "0xAbC1...Ef23",
      status: "pending" as const,
      signatures: { current: 1, required: 2 },
      timestamp: "2 hours ago",
    },
    {
      id: "tx-002",
      type: "contract" as const,
      description: "Approve USDC Spending",
      to: "0x7F9c...8b12",
      status: "pending" as const,
      signatures: { current: 1, required: 2 },
      timestamp: "5 hours ago",
    },
  ],
  history: [
    {
      id: "tx-004",
      type: "transfer" as const,
      description: "Initial Funding",
      value: "1.0 ETH",
      to: "0x9D23...1234",
      status: "executed" as const,
      signatures: { current: 2, required: 2 },
      timestamp: "3 days ago",
    },
    {
      id: "tx-005",
      type: "settings" as const,
      description: "Add Owner",
      status: "executed" as const,
      signatures: { current: 2, required: 2 },
      timestamp: "1 week ago",
    },
  ],
};

type Tab = "pending" | "history" | "all";

function TransactionsContent() {
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "pending", label: "Pending", count: mockTransactions.pending.length },
    { id: "history", label: "History" },
    { id: "all", label: "All Transactions" },
  ];

  const getTransactions = () => {
    let transactions;
    switch (activeTab) {
      case "pending":
        transactions = mockTransactions.pending;
        break;
      case "history":
        transactions = mockTransactions.history;
        break;
      case "all":
        transactions = [...mockTransactions.pending, ...mockTransactions.history];
        break;
    }

    if (searchQuery) {
      return transactions.filter(
        (tx) =>
          tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.to?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return transactions;
  };

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
            <button className="btn-primary">
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
                  {tab.count !== undefined && (
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
                className="input pl-10 py-2.5 text-sm"
              />
            </div>
          </div>

          {/* Transaction List */}
          <div className="space-y-4">
            {getTransactions().length > 0 ? (
              getTransactions().map((tx, index) => (
                <div key={tx.id} style={{ animationDelay: `${index * 50}ms` }}>
                  <TransactionCard {...tx} />
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
                    : "Create your first transaction to get started"}
                </p>
                {!searchQuery && (
                  <button className="btn-primary mx-auto">
                    Create Transaction
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
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
