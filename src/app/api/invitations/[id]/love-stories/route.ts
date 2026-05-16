import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const loveStory = await prisma.loveStory.create({
      data: {
        invitationId: id,
        title: title.trim(),
        date: date ? String(date).trim() : null,
        description: description.trim(),
        imageUrl: imageUrl && typeof imageUrl === "string" ? imageUrl.trim() : null,
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
