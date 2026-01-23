import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { isAddress } from "viem";
import { concatenateSignatures, isValidSignature } from "@/app/lib/signatures";

// GET /api/transactions/[id]/signatures
// Get all signatures for a transaction (optionally concatenated for execution)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const concatenated = searchParams.get("concatenated") === "true";

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        wallet: true,
        signatures: {
          orderBy: { signedAt: "asc" }, // Order by when signed, not by address
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    const signatures = transaction.signatures.map((sig) => ({
      signer: sig.signerAddress,
      signature: sig.signature,
    }));

    // If concatenated format requested (for contract execution)
    if (concatenated) {
      const concatenatedSig = concatenateSignatures(
        signatures.map((s) => ({
          signer: s.signer,
          signature: s.signature as `0x${string}`,
        }))
      );

      return NextResponse.json({
        concatenatedSignature: concatenatedSig,
        signatureCount: signatures.length,
        threshold: transaction.wallet.threshold,
        isReady: signatures.length >= transaction.wallet.threshold,
      });
    }

    return NextResponse.json({
      signatures,
      signatureCount: signatures.length,
      threshold: transaction.wallet.threshold,
      isReady: signatures.length >= transaction.wallet.threshold,
    });
  } catch (error) {
    console.error("Error fetching signatures:", error);
    return NextResponse.json(
      { error: "Failed to fetch signatures" },
      { status: 500 }
    );
  }
}

// POST /api/transactions/[id]/signatures
// Submit a signature for a transaction
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { signature, signerAddress } = body;

    // Validate inputs
    if (!signature || !isValidSignature(signature)) {
      return NextResponse.json(
        { error: "Invalid signature format (must be 65 bytes hex)" },
        { status: 400 }
      );
    }

    if (!signerAddress || !isAddress(signerAddress)) {
      return NextResponse.json(
        { error: "Valid signer address is required" },
        { status: 400 }
      );
    }

    // Find transaction and wallet
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
        signatures: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (transaction.status !== "PENDING" && transaction.status !== "READY") {
      return NextResponse.json(
        { error: `Cannot sign transaction with status: ${transaction.status}` },
        { status: 400 }
      );
    }

    // Verify signer is an owner
    const owner = transaction.wallet.owners.find(
      (o) => o.address.toLowerCase() === signerAddress.toLowerCase()
    );

    if (!owner) {
      return NextResponse.json(
        { error: "Signer is not an owner of this wallet" },
        { status: 403 }
      );
    }

    // Check if already signed (one signature per owner per transaction)
    const existingSignature = transaction.signatures.find(
      (s) => s.signerAddress.toLowerCase() === signerAddress.toLowerCase()
    );

    if (existingSignature) {
      return NextResponse.json(
        { error: "You have already signed this transaction" },
        { status: 409 }
      );
    }

    // Create signature
    const newSignature = await prisma.signature.create({
      data: {
        transactionId: id,
        ownerId: owner.id,
        signature,
        signerAddress,
      },
    });

    // Check if we now have enough signatures
    const totalSignatures = transaction.signatures.length + 1;
    const isReady = totalSignatures >= transaction.wallet.threshold;

    // Update transaction status if ready
    if (isReady && transaction.status === "PENDING") {
      await prisma.transaction.update({
        where: { id },
        data: { status: "READY" },
      });
    }

    // Format signature for JSON response
    const formattedSignature = {
      id: newSignature.id,
      signerAddress: newSignature.signerAddress,
      signature: newSignature.signature,
      signedAt: newSignature.signedAt.toISOString(),
    };

    return NextResponse.json(
      {
        signature: formattedSignature,
        totalSignatures,
        threshold: transaction.wallet.threshold,
        isReady,
        message: isReady 
          ? "Transaction is ready to execute!" 
          : `Signature submitted. ${transaction.wallet.threshold - totalSignatures} more needed.`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting signature:", error);
    return NextResponse.json(
      { error: "Failed to submit signature" },
      { status: 500 }
    );
  }
}
