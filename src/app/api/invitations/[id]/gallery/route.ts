import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage, deleteFile } from "@/lib/cloudinary";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_GALLERY_COUNT,
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

// GET /api/invitations/[id]/gallery - List all gallery items
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

    const gallery = await prisma.gallery.findMany({
      where: { invitationId: id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ data: gallery });
  } catch (error) {
    console.error("GET /api/invitations/[id]/gallery error:", error);
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

// POST /api/invitations/[id]/gallery - Upload a photo
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

    // Check gallery count limit
    const currentCount = await prisma.gallery.count({
      where: { invitationId: id },
    });

    if (currentCount >= MAX_GALLERY_COUNT) {
      return NextResponse.json(
        {
          error: "Payload Too Large",
          message: `Maksimal ${MAX_GALLERY_COUNT} foto per undangan`,
          statusCode: 413,
        },
        { status: 413 }
      );
    }

    // Parse FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "File foto wajib diunggah",
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!validateFileType(file.type, ALLOWED_IMAGE_TYPES)) {
      return NextResponse.json(
        {
          error: "Unsupported Media Type",
          message: "Format file tidak didukung. Gunakan JPG, PNG, atau WebP",
          statusCode: 415,
        },
        { status: 415 }
      );
    }

    // Convert file to buffer and upload to Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await uploadImage(
      buffer,
      `web-undangan/gallery/${id}`
    );

    // Save to database with next order number
    const galleryItem = await prisma.gallery.create({
      data: {
        invitationId: id,
        imageUrl: uploadResult.secure_url,
        order: currentCount,
      },
    });

    return NextResponse.json(
      {
        message: "Foto berhasil diunggah",
        data: galleryItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/invitations/[id]/gallery error:", error);
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

// DELETE /api/invitations/[id]/gallery - Delete a specific photo
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

    // Get photoId from query params or request body
    const { searchParams } = new URL(request.url);
    let photoId = searchParams.get("photoId");

    if (!photoId) {
      try {
        const body = await request.json();
        photoId = body.photoId;
      } catch {
        // No body provided
      }
    }

    if (!photoId) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "photoId wajib disertakan",
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    // Find the gallery item and verify it belongs to this invitation
    const galleryItem = await prisma.gallery.findFirst({
      where: {
        id: photoId,
        invitationId: id,
      },
    });

    if (!galleryItem) {
      return NextResponse.json(
        {
          error: "Not Found",
          message: "Foto tidak ditemukan",
          statusCode: 404,
        },
        { status: 404 }
      );
    }

    // Delete from Cloudinary
    const publicId = extractPublicId(galleryItem.imageUrl);
    if (publicId) {
      try {
        await deleteFile(publicId, "image");
      } catch (error) {
        console.error("Failed to delete from Cloudinary:", error);
        // Continue with database deletion even if Cloudinary fails
      }
    }

    // Delete from database
    await prisma.gallery.delete({
      where: { id: photoId },
    });

    return NextResponse.json({
      message: "Foto berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE /api/invitations/[id]/gallery error:", error);
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
