import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";

// GET /api/invitations/[id]/love-stories - List all love stories
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

    const loveStories = await prisma.loveStory.findMany({
      where: { invitationId: id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ data: loveStories });
  } catch (error) {
    console.error("GET /api/invitations/[id]/love-stories error:", error);
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

// POST /api/invitations/[id]/love-stories - Create a new love story
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

    const body = await request.json();
    const { title, date, description, imageUrl, order } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Judul cerita wajib diisi",
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string" || !description.trim()) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Deskripsi cerita wajib diisi",
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    // If imageUrl is a base64 data URL, upload to Cloudinary
    let finalImageUrl: string | null = null;
    if (imageUrl && typeof imageUrl === "string") {
      const trimmedUrl = imageUrl.trim();
      if (trimmedUrl.startsWith("data:")) {
        // Upload base64 data URL to Cloudinary
        const base64Data = trimmedUrl.split(",")[1];
        if (base64Data) {
          const buffer = Buffer.from(base64Data, "base64");
          const uploadResult = await uploadImage(buffer, `web-undangan/love-stories/${id}`);
          finalImageUrl = uploadResult.secure_url;
        }
      } else {
        // Already a URL (e.g., Cloudinary URL), use as-is
        finalImageUrl = trimmedUrl;
      }
    }

    const loveStory = await prisma.loveStory.create({
      data: {
        invitationId: id,
        title: title.trim(),
        date: date ? String(date).trim() : null,
        description: description.trim(),
        imageUrl: finalImageUrl,
        order: typeof order === "number" ? order : 0,
      },
    });

    return NextResponse.json(
      {
        message: "Love story berhasil ditambahkan",
        data: loveStory,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/invitations/[id]/love-stories error:", error);
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

// PATCH /api/invitations/[id]/love-stories - Update a love story
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Silakan login terlebih dahulu", statusCode: 401 },
        { status: 401 }
      );
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Not Found", message: "Undangan tidak ditemukan", statusCode: 404 },
        { status: 404 }
      );
    }

    if (invitation.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden", message: "Akses ditolak", statusCode: 403 },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { storyId, title, date, description } = body;

    if (!storyId) {
      return NextResponse.json(
        { error: "Validation Error", message: "storyId wajib disertakan", statusCode: 400 },
        { status: 400 }
      );
    }

    // Verify the story belongs to this invitation
    const existing = await prisma.loveStory.findFirst({
      where: { id: storyId, invitationId: id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Not Found", message: "Love story tidak ditemukan", statusCode: 404 },
        { status: 404 }
      );
    }

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Validation Error", message: "Judul cerita wajib diisi", statusCode: 400 },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string" || !description.trim()) {
      return NextResponse.json(
        { error: "Validation Error", message: "Deskripsi cerita wajib diisi", statusCode: 400 },
        { status: 400 }
      );
    }

    const updated = await prisma.loveStory.update({
      where: { id: storyId },
      data: {
        title: title.trim(),
        date: date ? String(date).trim() : null,
        description: description.trim(),
      },
    });

    return NextResponse.json({
      message: "Love story berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    console.error("PATCH /api/invitations/[id]/love-stories error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Terjadi kesalahan server", statusCode: 500 },
      { status: 500 }
    );
  }
}

// DELETE /api/invitations/[id]/love-stories - Delete a love story
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

    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get("storyId");

    if (!storyId) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "storyId wajib disertakan",
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    // Verify the story belongs to this invitation
    const loveStory = await prisma.loveStory.findFirst({
      where: {
        id: storyId,
        invitationId: id,
      },
    });

    if (!loveStory) {
      return NextResponse.json(
        {
          error: "Not Found",
          message: "Love story tidak ditemukan",
          statusCode: 404,
        },
        { status: 404 }
      );
    }

    await prisma.loveStory.delete({
      where: { id: storyId },
    });

    return NextResponse.json({
      message: "Love story berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE /api/invitations/[id]/love-stories error:", error);
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
