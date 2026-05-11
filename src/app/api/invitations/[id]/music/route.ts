import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadAudio, deleteFile } from "@/lib/cloudinary";
import {
  ALLOWED_MUSIC_TYPES,
  MAX_MUSIC_SIZE,
  validateFileType,
  validateFileSize,
} from "@/lib/validators";

/**
 * Extract Cloudinary public_id from a secure_url.
 * URL format: https://res.cloudinary.com/{cloud}/video/upload/v{version}/{folder}/{filename}.{ext}
 */
function extractPublicId(url: string): string | null {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// POST /api/invitations/[id]/music - Upload music
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

    // Parse FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "File musik wajib diunggah",
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!validateFileType(file.type, ALLOWED_MUSIC_TYPES)) {
      return NextResponse.json(
        {
          error: "Unsupported Media Type",
          message: "Format file harus MP3",
          statusCode: 415,
        },
        { status: 415 }
      );
    }

    // Validate file size
    if (!validateFileSize(file.size, MAX_MUSIC_SIZE)) {
      return NextResponse.json(
        {
          error: "Payload Too Large",
          message: "Ukuran file maksimal 10MB",
          statusCode: 413,
        },
        { status: 413 }
      );
    }

    // Convert file to buffer and upload to Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await uploadAudio(
      buffer,
      `web-undangan/music/${id}`
    );

    // Update invitation with music URL
    const updatedInvitation = await prisma.invitation.update({
      where: { id },
      data: { musicUrl: uploadResult.secure_url },
      select: { id: true, musicUrl: true },
    });

    return NextResponse.json(
      {
        message: "Musik berhasil diunggah",
        data: updatedInvitation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/invitations/[id]/music error:", error);
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

// DELETE /api/invitations/[id]/music - Remove music
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
      select: { userId: true, musicUrl: true },
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

    if (!invitation.musicUrl) {
      return NextResponse.json(
        {
          error: "Not Found",
          message: "Tidak ada musik yang diunggah",
          statusCode: 404,
        },
        { status: 404 }
      );
    }

    // Delete from Cloudinary (audio uses resource_type: "video")
    const publicId = extractPublicId(invitation.musicUrl);
    if (publicId) {
      try {
        await deleteFile(publicId, "video");
      } catch (error) {
        console.error("Failed to delete music from Cloudinary:", error);
        // Continue with database update even if Cloudinary fails
      }
    }

    // Set musicUrl to null in database
    await prisma.invitation.update({
      where: { id },
      data: { musicUrl: null },
    });

    return NextResponse.json({
      message: "Musik berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE /api/invitations/[id]/music error:", error);
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
