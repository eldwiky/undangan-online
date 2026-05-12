import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Validate phone number format (Indonesian: starts with 62, 10-15 digits)
function isValidPhone(phone: string): boolean {
  return /^62\d{8,13}$/.test(phone);
}

// Helper: check auth + ownership
async function checkOwnership(invitationId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized", message: "Silakan login terlebih dahulu", statusCode: 401 },
        { status: 401 }
      ),
    };
  }

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    select: { id: true, userId: true },
  });

  if (!invitation) {
    return {
      error: NextResponse.json(
        { error: "Not Found", message: "Undangan tidak ditemukan", statusCode: 404 },
        { status: 404 }
      ),
    };
  }

  if (invitation.userId !== session.user.id) {
    return {
      error: NextResponse.json(
        { error: "Forbidden", message: "Akses ditolak", statusCode: 403 },
        { status: 403 }
      ),
    };
  }

  return { invitation };
}

// GET /api/invitations/[id]/guests - List all guests
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await checkOwnership(id);
    if (result.error) return result.error;

    const guests = await prisma.guest.findMany({
      where: { invitationId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: guests });
  } catch (error) {
    console.error("GET /api/invitations/[id]/guests error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Terjadi kesalahan server", statusCode: 500 },
      { status: 500 }
    );
  }
}

// POST /api/invitations/[id]/guests - Add a new guest
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await checkOwnership(id);
    if (result.error) return result.error;

    const body = await request.json();
    const { name, phone } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Validation Error", message: "Nama tamu wajib diisi", statusCode: 400 },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "Validation Error", message: "Nomor telepon wajib diisi", statusCode: 400 },
        { status: 400 }
      );
    }

    // Clean phone: remove spaces, dashes, and leading +
    const cleanPhone = phone.replace(/[\s\-+]/g, "");

    if (!isValidPhone(cleanPhone)) {
      return NextResponse.json(
        { error: "Validation Error", message: "Format nomor telepon tidak valid. Gunakan format 62xxx (tanpa +)", statusCode: 400 },
        { status: 400 }
      );
    }

    const guest = await prisma.guest.create({
      data: {
        invitationId: id,
        name: name.trim(),
        phone: cleanPhone,
      },
    });

    return NextResponse.json(
      { message: "Tamu berhasil ditambahkan", data: guest },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/invitations/[id]/guests error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Terjadi kesalahan server", statusCode: 500 },
      { status: 500 }
    );
  }
}

// DELETE /api/invitations/[id]/guests?guestId=xxx - Remove a guest
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await checkOwnership(id);
    if (result.error) return result.error;

    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get("guestId");

    if (!guestId) {
      return NextResponse.json(
        { error: "Validation Error", message: "guestId wajib disertakan", statusCode: 400 },
        { status: 400 }
      );
    }

    // Verify guest belongs to this invitation
    const guest = await prisma.guest.findFirst({
      where: { id: guestId, invitationId: id },
    });

    if (!guest) {
      return NextResponse.json(
        { error: "Not Found", message: "Tamu tidak ditemukan", statusCode: 404 },
        { status: 404 }
      );
    }

    await prisma.guest.delete({ where: { id: guestId } });

    return NextResponse.json({ message: "Tamu berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/invitations/[id]/guests error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Terjadi kesalahan server", statusCode: 500 },
      { status: 500 }
    );
  }
}

// PATCH /api/invitations/[id]/guests - Mark guest as sent
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await checkOwnership(id);
    if (result.error) return result.error;

    const body = await request.json();
    const { guestId, sent } = body;

    if (!guestId) {
      return NextResponse.json(
        { error: "Validation Error", message: "guestId wajib disertakan", statusCode: 400 },
        { status: 400 }
      );
    }

    // Verify guest belongs to this invitation
    const guest = await prisma.guest.findFirst({
      where: { id: guestId, invitationId: id },
    });

    if (!guest) {
      return NextResponse.json(
        { error: "Not Found", message: "Tamu tidak ditemukan", statusCode: 404 },
        { status: 404 }
      );
    }

    const updatedGuest = await prisma.guest.update({
      where: { id: guestId },
      data: { sent: sent === true },
    });

    return NextResponse.json({ message: "Status berhasil diperbarui", data: updatedGuest });
  } catch (error) {
    console.error("PATCH /api/invitations/[id]/guests error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Terjadi kesalahan server", statusCode: 500 },
      { status: 500 }
    );
  }
}
