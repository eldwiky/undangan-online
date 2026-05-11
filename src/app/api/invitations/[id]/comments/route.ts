import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { commentSchema, sanitizeInput } from "@/lib/validators";
import { checkRateLimit } from "@/lib/rate-limiter";

// GET /api/invitations/[id]/comments - List comments (paginated, public)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invitation = await prisma.invitation.findUnique({
      where: { id },
      select: { id: true },
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

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = 10;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { invitationId: id },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.comment.count({
        where: { invitationId: id },
      }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      data: comments,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("GET /api/invitations/[id]/comments error:", error);
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

// POST /api/invitations/[id]/comments - Submit a comment (public, rate limited)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invitation = await prisma.invitation.findUnique({
      where: { id },
      select: { id: true },
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

    // Rate limiting by IP
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = forwarded?.split(",")[0]?.trim() || realIp || "unknown";

    const rateLimit = checkRateLimit(ip, 10, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too Many Requests",
          message: "Terlalu banyak pesan, coba lagi nanti",
          statusCode: 429,
        },
        { status: 429 }
      );
    }

    // Validate input
    const body = await request.json();
    const validation = commentSchema.safeParse(body);

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

    // Sanitize input to prevent XSS
    const sanitizedGuestName = sanitizeInput(validation.data.guestName);
    const sanitizedMessage = sanitizeInput(validation.data.message);

    // Save comment
    const comment = await prisma.comment.create({
      data: {
        invitationId: id,
        guestName: sanitizedGuestName,
        message: sanitizedMessage,
        attendance: validation.data.attendance,
      },
    });

    return NextResponse.json(
      {
        message: "Ucapan berhasil dikirim",
        data: comment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/invitations/[id]/comments error:", error);
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
