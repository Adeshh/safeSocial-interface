import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { isAddress } from "viem";

// GET /api/wallets/[address]
// Fetch a specific wallet by address
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!isAddress(address)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    const wallet = await prisma.wallet.findUnique({
      where: { address },
      include: {
        owners: {
          where: { isActive: true },
          orderBy: { addedAt: "asc" },
        },
        transactions: {
          where: { status: "PENDING" },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            signatures: true,
          },
        },
      },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 404 }
      );
    }

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
      transactions: wallet.transactions.map((tx) => ({
        id: tx.id,
        nonce: tx.nonce.toString(),
        to: tx.to,
        value: tx.value,
        status: tx.status,
        type: tx.type,
        description: tx.description,
        safeTxHash: tx.safeTxHash,
        createdAt: tx.createdAt.toISOString(),
        signatureCount: tx.signatures.length,
      })),
    };

    return NextResponse.json({ wallet: formattedWallet });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet" },
      { status: 500 }
    );
  }
}

// PATCH /api/wallets/[address]
// Update wallet (e.g., name)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const body = await request.json();
    const { name } = body;

    if (!isAddress(address)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    const wallet = await prisma.wallet.update({
      where: { address },
      data: { name },
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
    };

    return NextResponse.json({ wallet: formattedWallet });
  } catch (error) {
    console.error("Error updating wallet:", error);
    return NextResponse.json(
      { error: "Failed to update wallet" },
      { status: 500 }
    );
  }
}
