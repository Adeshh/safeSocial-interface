import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { isAddress } from "viem";

// GET /api/wallets?owner=0x...
// Fetch all wallets where the given address is an owner
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ownerAddress = searchParams.get("owner");

    if (!ownerAddress || !isAddress(ownerAddress)) {
      return NextResponse.json(
        { error: "Valid owner address is required" },
        { status: 400 }
      );
    }

    const wallets = await prisma.wallet.findMany({
      where: {
        owners: {
          some: {
            address: {
              equals: ownerAddress,
              mode: "insensitive",
            },
            isActive: true,
          },
        },
      },
      include: {
        owners: {
          where: { isActive: true },
          orderBy: { addedAt: "asc" },
        },
        _count: {
          select: { transactions: { where: { status: "PENDING" } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform to frontend format
    const formatted = wallets.map((wallet) => ({
      id: wallet.id,
      address: wallet.address,
      name: wallet.name,
      threshold: wallet.threshold,
      owners: wallet.owners.length,
      ownersList: wallet.owners.map((o) => ({
        address: o.address,
        name: o.name,
      })),
      pendingTxCount: wallet._count.transactions,
      chainId: wallet.chainId,
      createdAt: wallet.createdAt.toISOString(),
      creationTxHash: wallet.creationTxHash,
    }));

    return NextResponse.json({ wallets: formatted });
  } catch (error) {
    console.error("Error fetching wallets:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallets" },
      { status: 500 }
    );
  }
}

// POST /api/wallets
// Create a new wallet record (called after on-chain creation)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, name, owners, threshold, creationTxHash, blockNumber } = body;

    // Validate required fields
    if (!address || !isAddress(address)) {
      return NextResponse.json(
        { error: "Valid wallet address is required" },
        { status: 400 }
      );
    }

    if (!owners || !Array.isArray(owners) || owners.length === 0) {
      return NextResponse.json(
        { error: "At least one owner is required" },
        { status: 400 }
      );
    }

    if (!threshold || threshold < 1 || threshold > owners.length) {
      return NextResponse.json(
        { error: "Invalid threshold" },
        { status: 400 }
      );
    }

    // Check if wallet already exists
    const existing = await prisma.wallet.findUnique({
      where: { address },
    });

    if (existing) {
      // Format existing wallet for JSON response
      const formattedExisting = {
        id: existing.id,
        address: existing.address,
        name: existing.name,
        threshold: existing.threshold,
        chainId: existing.chainId,
        createdAt: existing.createdAt.toISOString(),
        creationTxHash: existing.creationTxHash,
        blockNumber: existing.blockNumber?.toString(),
      };
      return NextResponse.json(
        { error: "Wallet already exists", wallet: formattedExisting },
        { status: 409 }
      );
    }

    // Create wallet with owners
    const wallet = await prisma.wallet.create({
      data: {
        address,
        name: name || `SafeSocial Wallet`,
        threshold,
        chainId: 11155111, // Sepolia
        creationTxHash,
        blockNumber: blockNumber ? BigInt(blockNumber) : null,
        owners: {
          create: owners.map((ownerAddress: string, index: number) => ({
            address: ownerAddress,
            name: index === 0 ? "Creator" : null,
          })),
        },
      },
      include: {
        owners: true,
      },
    });

    // Format wallet for JSON response (BigInt -> string)
    const formattedWallet = {
      id: wallet.id,
      address: wallet.address,
      name: wallet.name,
      threshold: wallet.threshold,
      chainId: wallet.chainId,
      createdAt: wallet.createdAt.toISOString(),
      creationTxHash: wallet.creationTxHash,
      blockNumber: wallet.blockNumber?.toString(),
      owners: wallet.owners.map((o) => ({
        id: o.id,
        address: o.address,
        name: o.name,
        addedAt: o.addedAt.toISOString(),
      })),
    };

    return NextResponse.json({ wallet: formattedWallet }, { status: 201 });
  } catch (error) {
    console.error("Error creating wallet:", error);
    return NextResponse.json(
      { error: "Failed to create wallet" },
      { status: 500 }
    );
  }
}
