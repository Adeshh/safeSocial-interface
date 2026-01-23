// SafeSocial Contract ABIs - ERC-4337 Account Abstraction

export const SAFE_SOCIAL_FACTORY_ABI = [
  // Deploy wallet
  {
    type: "function",
    name: "deployWallet",
    inputs: [
      { name: "owners", type: "address[]" },
      { name: "threshold", type: "uint256" },
    ],
    outputs: [{ name: "safeSocialWallet", type: "address" }],
    stateMutability: "nonpayable",
  },
  // Deploy with deterministic address (CREATE2)
  {
    type: "function",
    name: "deployWalletDeterministic",
    inputs: [
      { name: "owners", type: "address[]" },
      { name: "threshold", type: "uint256" },
      { name: "salt", type: "bytes32" },
    ],
    outputs: [{ name: "safeSocialWallet", type: "address" }],
    stateMutability: "nonpayable",
  },
  // Compute deterministic address
  {
    type: "function",
    name: "computeWalletAddress",
    inputs: [
      { name: "owners", type: "address[]" },
      { name: "threshold", type: "uint256" },
      { name: "salt", type: "bytes32" },
    ],
    outputs: [{ name: "safeSocialWallet", type: "address" }],
    stateMutability: "view",
  },
  // Check if valid wallet
  {
    type: "function",
    name: "isSafeSocialWallet",
    inputs: [{ name: "wallet", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isValidWallet",
    inputs: [{ name: "wallet", type: "address" }],
    outputs: [{ name: "isValid", type: "bool" }],
    stateMutability: "view",
  },
  // Get wallet count
  {
    type: "function",
    name: "getWalletCount",
    inputs: [],
    outputs: [{ name: "count", type: "uint256" }],
    stateMutability: "view",
  },
  // Event
  {
    type: "event",
    name: "NewSafeSocialWallet",
    inputs: [
      { name: "index", type: "uint256", indexed: true },
      { name: "wallet", type: "address", indexed: true },
      { name: "owners", type: "address[]", indexed: false },
      { name: "threshold", type: "uint256", indexed: false },
      { name: "salt", type: "bytes32", indexed: false },
    ],
  },
] as const;

export const SAFE_SOCIAL_WALLET_ABI = [
  // Execute single call
  {
    type: "function",
    name: "execute",
    inputs: [
      { name: "dest", type: "address" },
      { name: "value", type: "uint256" },
      { name: "functionData", type: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  // Execute batch calls
  {
    type: "function",
    name: "executeBatch",
    inputs: [
      {
        name: "calls",
        type: "tuple[]",
        components: [
          { name: "target", type: "address" },
          { name: "value", type: "uint256" },
          { name: "functionData", type: "bytes" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  // Get entry point
  {
    type: "function",
    name: "entryPoint",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  // From IOwnersAndThreshouldManager
  {
    type: "function",
    name: "getOwners",
    inputs: [],
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getThreshould", // Note: typo in original contract
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  // Owner management functions (inherited from OwnersAndThreshouldManager)
  {
    type: "function",
    name: "addOwner",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "removeOwner",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateThreshould", // Note: typo in original contract
    inputs: [{ name: "newThreshould", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  // Receive ETH
  {
    type: "receive",
    stateMutability: "payable",
  },
] as const;

export const SOCIAL_PAYMASTER_ABI = [
  {
    type: "function",
    name: "addToken",
    inputs: [
      { name: "token", type: "address" },
      { name: "tokenFeed", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "removeToken",
    inputs: [{ name: "token", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "restrictSafeSocialWallet",
    inputs: [{ name: "safeSocialWallet", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "unrestrictSafeSocialWallet",
    inputs: [{ name: "safeSocialWallet", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawTokens",
    inputs: [
      { name: "token", type: "address" },
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  // Events
  {
    type: "event",
    name: "TokenSupported",
    inputs: [
      { name: "token", type: "address", indexed: true },
      { name: "tokenFeed", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "TokenNotSupported",
    inputs: [{ name: "token", type: "address", indexed: false }],
  },
  {
    type: "event",
    name: "SafeSocialWalletRestricted",
    inputs: [{ name: "safeSocialWallet", type: "address", indexed: true }],
  },
  {
    type: "event",
    name: "SafeSocialWalletUnrestricted",
    inputs: [{ name: "safeSocialWallet", type: "address", indexed: true }],
  },
  {
    type: "event",
    name: "TokensWithdrawn",
    inputs: [
      { name: "token", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;

// ERC-4337 EntryPoint v0.7 ABI (PackedUserOperation format)
export const ENTRY_POINT_ABI = [
  {
    type: "function",
    name: "handleOps",
    inputs: [
      {
        name: "ops",
        type: "tuple[]",
        components: [
          { name: "sender", type: "address" },
          { name: "nonce", type: "uint256" },
          { name: "initCode", type: "bytes" },
          { name: "callData", type: "bytes" },
          { name: "accountGasLimits", type: "bytes32" }, // packed: verificationGasLimit || callGasLimit
          { name: "preVerificationGas", type: "uint256" },
          { name: "gasFees", type: "bytes32" }, // packed: maxPriorityFeePerGas || maxFeePerGas
          { name: "paymasterAndData", type: "bytes" },
          { name: "signature", type: "bytes" },
        ],
      },
      { name: "beneficiary", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getNonce",
    inputs: [
      { name: "sender", type: "address" },
      { name: "key", type: "uint192" },
    ],
    outputs: [{ name: "nonce", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserOpHash",
    inputs: [
      {
        name: "userOp",
        type: "tuple",
        components: [
          { name: "sender", type: "address" },
          { name: "nonce", type: "uint256" },
          { name: "initCode", type: "bytes" },
          { name: "callData", type: "bytes" },
          { name: "accountGasLimits", type: "bytes32" },
          { name: "preVerificationGas", type: "uint256" },
          { name: "gasFees", type: "bytes32" },
          { name: "paymasterAndData", type: "bytes" },
          { name: "signature", type: "bytes" },
        ],
      },
    ],
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "depositTo",
    inputs: [{ name: "account", type: "address" }],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;
