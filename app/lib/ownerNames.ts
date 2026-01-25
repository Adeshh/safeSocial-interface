// Local storage utility for owner names
// Names are stored per-user in browser cache

const STORAGE_KEY = "safesocial_owner_names";

interface OwnerNames {
  [address: string]: string;
}

export function getOwnerNames(): OwnerNames {
  if (typeof window === "undefined") return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function getOwnerName(address: string): string | null {
  const names = getOwnerNames();
  // Normalize address to lowercase for consistent lookup
  return names[address.toLowerCase()] || null;
}

export function setOwnerName(address: string, name: string): void {
  if (typeof window === "undefined") return;
  
  const names = getOwnerNames();
  names[address.toLowerCase()] = name;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
  } catch (err) {
    console.error("Failed to save owner name:", err);
  }
}

export function removeOwnerName(address: string): void {
  if (typeof window === "undefined") return;
  
  const names = getOwnerNames();
  delete names[address.toLowerCase()];
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
  } catch (err) {
    console.error("Failed to remove owner name:", err);
  }
}
