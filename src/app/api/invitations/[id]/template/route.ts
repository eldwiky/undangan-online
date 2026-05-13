import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_TEMPLATES = ["elegant", "spotify", "floral", "garden"];

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

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
    const { template } = body;

    if (!template || !VALID_TEMPLATES.includes(template)) {
      return NextResponse.json(
        { error: "Validation Error", message: "Template tidak valid", statusCode: 400 },
        { status: 400 }
      );
    }

    const updated = await prisma.invitation.update({
      where: { id },
      data: { template },
      select: { id: true, template: true },
    });

    return NextResponse.json({
      message: "Template berhasil diubah",
      data: updated,
    });
  } catch (error) {
    console.error("PUT /api/invitations/[id]/template error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Terjadi kesalahan server", statusCode: 500 },
      { status: 500 }
    );
  }
}
