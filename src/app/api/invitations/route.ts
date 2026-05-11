import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invitationSchema } from "@/lib/validators";
import { generateSlug, ensureUniqueSlug } from "@/lib/slug";

export async function GET() {
  try {
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

    const invitations = await prisma.invitation.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: invitations });
  } catch (error) {
    console.error("GET /api/invitations error:", error);
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

export async function POST(request: Request) {
  try {
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

    const body = await request.json();

    const result = invitationSchema.safeParse(body);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Input tidak valid",
          errors: fieldErrors,
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    const { groomName, brideName, eventDate, eventTime, location, locationName, mapsUrl, description } = result.data;

    // Generate unique slug
    const baseSlug = generateSlug(groomName, brideName);
    const existingSlugs = await prisma.invitation.findMany({
      where: { slug: { startsWith: baseSlug } },
      select: { slug: true },
    });
    const slug = ensureUniqueSlug(baseSlug, existingSlugs.map((i) => i.slug));

    // Auto-generate title
    const title = `Pernikahan ${groomName} & ${brideName}`;

    const invitation = await prisma.invitation.create({
      data: {
        userId: session.user.id,
        groomName,
        brideName,
        title,
        slug,
        eventDate: new Date(eventDate),
        eventTime: eventTime || null,
        location: location || null,
        locationName: locationName || null,
        mapsUrl: mapsUrl || null,
        description: description || null,
      },
    });

    return NextResponse.json(
      {
        message: "Undangan berhasil dibuat",
        data: invitation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/invitations error:", error);
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
