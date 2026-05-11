import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage, deleteFile } from "@/lib/cloudinary";
import {
  giftAccountSchema,
  ALLOWED_IMAGE_TYPES,
  validateFileType,
} from "@/lib/validators";

/**
 * Extract Cloudinary public_id from a secure_url.
 * URL format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{folder}/{filename}.{ext}
 */
function extractPublicId(url: string): string | null {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// GET /api/invitations/[id]/gift-accounts - List all gift accounts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Silakan login terlebih dahulu",
          statusCode: 401,
        },
        { status: 401 }
      );
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!invitation) {
      return NextResponse.json(
        {
          error: "Not Found",
          message: "Undangan tidak ditemukan",
          statusCode: 404,
        },
        { status: 404 }
      );
    }

    if (invitation.userId !== session.user.id) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "Akses ditolak",
          statusCode: 403,
        },
        { status: 403 }
      );
    }

    const giftAccounts = await prisma.giftAccount.findMany({
      where: { invitationId: id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ data: giftAccounts });
  } catch (error) {
    console.error("GET /api/invitations/[id]/gift-accounts error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Terjadi kesalahan server",
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}

// POST /api/invitations/[id]/gift-accounts - Create a new gift account
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Silakan login terlebih dahulu",
          statusCode: 401,
        },
        { status: 401 }
      );
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!invitation) {
      return NextResponse.json(
        {
          error: "Not Found",
          message: "Undangan tidak ditemukan",
          statusCode: 404,
        },
        { status: 404 }
      );
    }

    if (invitation.userId !== session.user.id) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "Akses ditolak",
          statusCode: 403,
        },
        { status: 403 }
      );
    }

    // Determine content type to handle both JSON and FormData
    const contentType = request.headers.get("content-type") || "";
    let bankName: string;
    let accountNumber: string;
    let accountHolder: string;
    let qrisUrl: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData (with optional QRIS image)
      const formData = await request.formData();
      bankName = formData.get("bankName") as string || "";
      accountNumber = formData.get("accountNumber") as string || "";
      accountHolder = formData.get("accountHolder") as string || "";

      const qrisFile = formData.get("qrisImage") as File | null;

      // Validate input fields
      const validation = giftAccountSchema.safeParse({
        bankName,
        accountNumber,
        accountHolder,
      });

      if (!validation.success) {
        const errors = validation.error.issues.map((e) => e.message).join(", ");
        return NextResponse.json(
          {
            error: "Validation Error",
            message: errors,
            statusCode: 400,
          },
          { status: 400 }
        );
      }

      // Upload QRIS image if provided
      if (qrisFile && qrisFile.size > 0) {
        if (!validateFileType(qrisFile.type, ALLOWED_IMAGE_TYPES)) {
          return NextResponse.json(
            {
              error: "Unsupported Media Type",
              message: "Format file QRIS tidak didukung. Gunakan JPG, PNG, atau WebP",
              statusCode: 415,
            },
            { status: 415 }
          );
        }

        const arrayBuffer = await qrisFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await uploadImage(
          buffer,
          `web-undangan/qris/${id}`
        );
        qrisUrl = uploadResult.secure_url;
      }
    } else {
      // Handle JSON body (without QRIS image)
      const body = await request.json();

      const validation = giftAccountSchema.safeParse(body);

      if (!validation.success) {
        const errors = validation.error.issues.map((e) => e.message).join(", ");
        return NextResponse.json(
          {
            error: "Validation Error",
            message: errors,
            statusCode: 400,
          },
          { status: 400 }
        );
      }

      bankName = validation.data.bankName;
      accountNumber = validation.data.accountNumber;
      accountHolder = validation.data.accountHolder;
    }

    // Save to database
    const giftAccount = await prisma.giftAccount.create({
      data: {
        invitationId: id,
        bankName,
        accountNumber,
        accountHolder,
        qrisUrl,
      },
    });

    return NextResponse.json(
      {
        message: "Rekening hadiah berhasil ditambahkan",
        data: giftAccount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/invitations/[id]/gift-accounts error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Terjadi kesalahan server",
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/invitations/[id]/gift-accounts - Delete a gift account
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Silakan login terlebih dahulu",
          statusCode: 401,
        },
        { status: 401 }
      );
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!invitation) {
      return NextResponse.json(
        {
          error: "Not Found",
          message: "Undangan tidak ditemukan",
          statusCode: 404,
        },
        { status: 404 }
      );
    }

    if (invitation.userId !== session.user.id) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "Akses ditolak",
          statusCode: 403,
        },
        { status: 403 }
      );
    }

    // Get accountId from query params
    const { searchParams } = new URL(request.url);
    let accountId = searchParams.get("accountId");

    if (!accountId) {
      try {
        const body = await request.json();
        accountId = body.accountId;
      } catch {
        // No body provided
      }
    }

    if (!accountId) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "accountId wajib disertakan",
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    // Find the gift account and verify it belongs to this invitation
    const giftAccount = await prisma.giftAccount.findFirst({
      where: {
        id: accountId,
        invitationId: id,
      },
    });

    if (!giftAccount) {
      return NextResponse.json(
        {
          error: "Not Found",
          message: "Rekening hadiah tidak ditemukan",
          statusCode: 404,
        },
        { status: 404 }
      );
    }

    // Delete QRIS image from Cloudinary if exists
    if (giftAccount.qrisUrl) {
      const publicId = extractPublicId(giftAccount.qrisUrl);
      if (publicId) {
        try {
          await deleteFile(publicId, "image");
        } catch (error) {
          console.error("Failed to delete QRIS from Cloudinary:", error);
          // Continue with database deletion even if Cloudinary fails
        }
      }
    }

    // Delete from database
    await prisma.giftAccount.delete({
      where: { id: accountId },
    });

    return NextResponse.json({
      message: "Rekening hadiah berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE /api/invitations/[id]/gift-accounts error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Terjadi kesalahan server",
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}
