import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";

// GET /api/transactions/[id]
// Fetch a specific transaction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        wallet: {
          include: {
            owners: {
              where: { isActive: true },
            },
          },
        },
        signatures: {
          include: {
            owner: true,
          },
          orderBy: {
            signerAddress: "asc", // Important: signatures must be sorted
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Format for JSON response (BigInt -> string, Date -> ISO string)
    const formatted = {
      id: transaction.id,
      nonce: transaction.nonce.toString(),
      to: transaction.to,
      value: transaction.value,
      data: transaction.data,
      callData: transaction.callData,
      safeTxHash: transaction.safeTxHash,
      userOpHash: transaction.safeTxHash,
      status: transaction.status,
      type: transaction.type,
      description: transaction.description,
      createdBy: transaction.createdBy,
      createdAt: transaction.createdAt.toISOString(),
      executedAt: transaction.executedAt?.toISOString(),
      executionTxHash: transaction.executionTxHash,
      threshold: transaction.wallet.threshold,
      owners: transaction.wallet.owners,
      signatures: transaction.signatures.map((sig) => ({
        id: sig.id,
        signerAddress: sig.signerAddress,
        signerName: sig.owner?.name,
        signature: sig.signature,
        signedAt: sig.signedAt.toISOString(),
      })),
      signatureCount: transaction.signatures.length,
    };

    return NextResponse.json({ transaction: formatted });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 }
    );
  }
}

// PATCH /api/transactions/[id]
// Update transaction status (e.g., after execution or cancellation)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, executionTxHash, executedBy, cancelledBy } = body;

    // Fetch existing transaction for validation
    const existingTx = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTx) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // If cancelling, verify transaction is still pending
    if (status === "CANCELLED") {
      if (existingTx.status !== "PENDING" && existingTx.status !== "READY") {
        return NextResponse.json(
          { error: "Only pending transactions can be cancelled" },
          { status: 400 }
        );
      }
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(executionTxHash && { executionTxHash }),
        ...(executedBy && { executedBy }),
        ...(status === "EXECUTED" && { executedAt: new Date() }),
      },
    });

    // Format for JSON response (BigInt -> string)
    const formatted = {
      id: transaction.id,
      nonce: transaction.nonce.toString(),
      to: transaction.to,
      value: transaction.value,
      data: transaction.data,
      safeTxHash: transaction.safeTxHash,
      userOpHash: transaction.safeTxHash,
      status: transaction.status,
      type: transaction.type,
      description: transaction.description,
      createdBy: transaction.createdBy,
      createdAt: transaction.createdAt.toISOString(),
      executedAt: transaction.executedAt?.toISOString(),
      executionTxHash: transaction.executionTxHash,
    };

    return NextResponse.json({ transaction: formatted });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}
