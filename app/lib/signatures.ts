import { type Hex, concat } from "viem";

/**
 * Signature utilities for SafeSocial multisig
 * 
 * The contract manages signature ordering internally.
 * We just need to:
 * 1. Ensure each owner signs only once per transaction
 * 2. Concatenate all signatures when threshold is met
 * 
 * Each signature is 65 bytes: r (32) + s (32) + v (1)
 */

export interface SignatureData {
  signer: string;
  signature: Hex;
}

/**
 * Concatenate signatures for contract execution
 * No sorting needed - contract handles validation
 */
export function concatenateSignatures(signatures: SignatureData[]): Hex {
  if (signatures.length === 0) {
    return "0x" as Hex;
  }

  const signatureHexes = signatures.map(s => s.signature);
  return concat(signatureHexes);
}

/**
 * Validate that a signature has the correct length (65 bytes = 130 hex chars + 0x)
 */
export function isValidSignature(signature: string): boolean {
  if (!signature.startsWith("0x")) return false;
  // 0x + 130 hex characters = 132 total length
  return signature.length === 132;
}

/**
 * Check if we have enough valid signatures to execute
 */
export function hasEnoughSignatures(
  signaturesCount: number,
  threshold: number
): boolean {
  return signaturesCount >= threshold;
}

/**
 * Extract individual signatures from a concatenated signature bytes
 * (useful for debugging or verification)
 */
export function splitSignatures(concatenatedSig: Hex): Hex[] {
  const sigHex = concatenatedSig.slice(2); // Remove 0x prefix
  const signatureLength = 130; // 65 bytes = 130 hex chars
  const signatures: Hex[] = [];

  for (let i = 0; i < sigHex.length; i += signatureLength) {
    signatures.push(("0x" + sigHex.slice(i, i + signatureLength)) as Hex);
  }

  return signatures;
}
