import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { isAddress, type Address } from "viem";

// GET /api/transactions?wallet=0x...&status=PENDING
// Fetch transactions for a wallet
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get("wallet");
    const status = searchParams.get("status");

    if (!walletAddress || !isAddress(walletAddress)) {
      return NextResponse.json(
        { error: "Valid wallet address is required" },
        { status: 400 }
      );
    }

    const wallet = await prisma.wallet.findUnique({
      where: { address: walletAddress },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 404 }
      );
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        walletId: wallet.id,
        ...(status && { status: status as any }),
      },
      include: {
        signatures: {
          include: {
            owner: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform for frontend
    const formatted = transactions.map((tx) => ({
      id: tx.id,
      nonce: tx.nonce.toString(),
      to: tx.to,
      value: tx.value,
      data: tx.data,
      callData: tx.callData,
      paymasterAndData: tx.paymasterAndData,
      safeTxHash: tx.safeTxHash,
      userOpHash: tx.safeTxHash, // Alias for frontend
      status: tx.status,
      type: tx.type,
      description: tx.description,
      signatures: tx.signatures.map((sig) => ({
        id: sig.id,
        signerAddress: sig.signerAddress,
        signerName: sig.owner?.name,
        signature: sig.signature,
        signedAt: sig.signedAt.toISOString(),
      })),
      signatureCount: tx.signatures.length,
      threshold: wallet.threshold,
      createdAt: tx.createdAt.toISOString(),
      createdBy: tx.createdBy,
      executedAt: tx.executedAt?.toISOString(),
      executionTxHash: tx.executionTxHash,
    }));

    return NextResponse.json({ transactions: formatted });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

// POST /api/transactions
// Propose a new transaction (ERC-4337 UserOp)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      walletAddress,
      to,
      value,
      data,
      safeTxHash, // This is actually userOpHash
      nonce,
      description,
      type,
      createdBy,
      callData, // Encoded execute() callData for UserOp
      paymasterAndData, // Paymaster data for gas sponsorship
    } = body;

    // Validate required fields
    if (!walletAddress || !isAddress(walletAddress)) {
      return NextResponse.json(
        { error: "Valid wallet address is required" },
        { status: 400 }
      );
    }

    if (!to || !isAddress(to)) {
      return NextResponse.json(
        { error: "Valid 'to' address is required" },
        { status: 400 }
      );
    }

    if (!safeTxHash) {
      return NextResponse.json(
        { error: "safeTxHash is required" },
        { status: 400 }
      );
    }

    if (!createdBy || !isAddress(createdBy)) {
      return NextResponse.json(
        { error: "Valid createdBy address is required" },
        { status: 400 }
      );
    }

    // Find wallet
    const wallet = await prisma.wallet.findUnique({
      where: { address: walletAddress },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 404 }
      );
    }

    // Check if transaction already exists
    const existing = await prisma.transaction.findUnique({
      where: { safeTxHash },
    });

    if (existing) {
      // Format existing transaction for JSON response
      const formattedExisting = {
        id: existing.id,
        nonce: existing.nonce.toString(),
        to: existing.to,
        value: existing.value,
        data: existing.data,
        safeTxHash: existing.safeTxHash,
        status: existing.status,
        type: existing.type,
        description: existing.description,
        createdAt: existing.createdAt.toISOString(),
        createdBy: existing.createdBy,
      };
      return NextResponse.json(
        { error: "Transaction already exists", transaction: formattedExisting },
        { status: 409 }
      );
    }

    // Create transaction (ERC-4337 UserOp)
    const transaction = await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        nonce: BigInt(nonce),
        to,
        value: value || "0",
        data: data || "0x",
        callData: callData || null, // Encoded execute() for UserOp
        paymasterAndData: paymasterAndData || null, // Paymaster data
        safeTxHash, // userOpHash
        description,
        type: type || "TRANSFER",
        createdBy,
        status: "PENDING",
      },
    });

    // Format transaction for JSON response (BigInt -> string)
    const formattedTransaction = {
      id: transaction.id,
      nonce: transaction.nonce.toString(),
      to: transaction.to,
      value: transaction.value,
      data: transaction.data,
      safeTxHash: transaction.safeTxHash,
      userOpHash: transaction.safeTxHash, // Alias for frontend
      status: transaction.status,
      type: transaction.type,
      description: transaction.description,
      createdAt: transaction.createdAt.toISOString(),
      createdBy: transaction.createdBy,
      signatureCount: 0,
      threshold: wallet.threshold,
    };

    return NextResponse.json({ transaction: formattedTransaction }, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
