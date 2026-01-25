"use client";

import { useState, useEffect } from "react";
import { getOwnerName, setOwnerName } from "../lib/ownerNames";

interface OwnerCardProps {
  address: string;
  name?: string;
  isCurrentUser?: boolean;
  addedAt: string;
}

export function OwnerCard({ address, name: initialName, isCurrentUser, addedAt }: OwnerCardProps) {
  const [copied, setCopied] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [localName, setLocalName] = useState<string>("");
  const [nameInputValue, setNameInputValue] = useState("");

  // Load name from localStorage on mount
  useEffect(() => {
    const storedName = getOwnerName(address);
    if (storedName) {
      setLocalName(storedName);
    }
  }, [address]);

  const displayName = localName || initialName;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSaveName = () => {
    if (nameInputValue.trim()) {
      setOwnerName(address, nameInputValue.trim());
      setLocalName(nameInputValue.trim());
    }
    setShowNameInput(false);
    setNameInputValue("");
  };

  const handleEditName = () => {
    setNameInputValue(localName || "");
    setShowNameInput(true);
  };

  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-bg-primary font-semibold">
            {displayName ? displayName.charAt(0).toUpperCase() : address.slice(2, 4).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              {displayName && (
                <h3 className="font-medium text-text-primary">{displayName}</h3>
              )}
              {isCurrentUser && (
                <span className="badge badge-info text-xs">YOU</span>
              )}
            </div>
            {/* Copyable address */}
            <button
              onClick={handleCopy}
              className="group flex items-center gap-2 text-sm font-mono text-text-muted hover:text-text-primary transition-colors"
              title="Click to copy address"
            >
              <span>{address}</span>
              {copied ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-status-success">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-text-muted">Added</p>
            <p className="text-sm text-text-secondary">{addedAt}</p>
          </div>
          
          {/* Menu button */}
          <div className="relative">
            <button 
              onClick={handleEditName}
              className="btn-ghost p-2"
              title="Edit name"
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
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Name input overlay */}
      {showNameInput && (
        <div className="mt-4 pt-4 border-t border-border-subtle">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Set a name for this owner (saved locally)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={nameInputValue}
              onChange={(e) => setNameInputValue(e.target.value)}
              placeholder="Enter a name..."
              className="input flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveName();
                if (e.key === "Escape") setShowNameInput(false);
              }}
            />
            <button
              onClick={handleSaveName}
              className="btn-primary"
            >
              Save
            </button>
            <button
              onClick={() => setShowNameInput(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-text-muted mt-2">
            This name is stored in your browser only and won&apos;t be visible to other users.
          </p>
        </div>
      )}
    </div>
  );
}
