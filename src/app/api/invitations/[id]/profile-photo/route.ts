import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";
import { ALLOWED_IMAGE_TYPES, validateFileType } from "@/lib/validators";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized", message: "Silakan login", statusCode: 401 }, { status: 401 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Not Found", message: "Undangan tidak ditemukan", statusCode: 404 }, { status: 404 });
    }

    if (invitation.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden", message: "Akses ditolak", statusCode: 403 }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null; // "groomPhoto" or "bridePhoto"

    if (!file) {
      return NextResponse.json({ error: "Validation Error", message: "File wajib diunggah", statusCode: 400 }, { status: 400 });
    }

    if (!validateFileType(file.type, ALLOWED_IMAGE_TYPES)) {
      return NextResponse.json({ error: "Unsupported Media Type", message: "Format file tidak didukung", statusCode: 415 }, { status: 415 });
    }

    if (!type || !["groomPhoto", "bridePhoto"].includes(type)) {
      return NextResponse.json({ error: "Validation Error", message: "Type harus groomPhoto atau bridePhoto", statusCode: 400 }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await uploadImage(buffer, `web-undangan/profiles/${id}`);

    // Update the invitation with the photo URL
    await prisma.invitation.update({
      where: { id },
      data: { [type]: uploadResult.secure_url },
    });

    return NextResponse.json({ url: uploadResult.secure_url }, { status: 200 });
  } catch (error) {
    console.error("POST /api/invitations/[id]/profile-photo error:", error);
    return NextResponse.json({ error: "Internal Server Error", message: "Terjadi kesalahan server", statusCode: 500 }, { status: 500 });
  }
}
