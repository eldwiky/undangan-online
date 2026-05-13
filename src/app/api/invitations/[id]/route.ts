import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invitationSchema } from "@/lib/validators";

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
      include: {
        gallery: { orderBy: { order: "asc" } },
        comments: { orderBy: { createdAt: "desc" } },
        giftAccounts: true,
      },
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

    return NextResponse.json({ data: invitation });
  } catch (error) {
    console.error("GET /api/invitations/[id] error:", error);
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

export async function PUT(
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

    // Only update fields that are explicitly present in the body
    // Use undefined (not null) for fields not in body — Prisma skips undefined fields
    const hashtag = "hashtag" in body ? (body.hashtag || null) : undefined;
    const groomFather = "groomFather" in body ? (body.groomFather || null) : undefined;
    const groomMother = "groomMother" in body ? (body.groomMother || null) : undefined;
    const groomChildOrder = "groomChildOrder" in body ? (body.groomChildOrder || null) : undefined;
    const brideFather = "brideFather" in body ? (body.brideFather || null) : undefined;
    const brideMother = "brideMother" in body ? (body.brideMother || null) : undefined;
    const brideChildOrder = "brideChildOrder" in body ? (body.brideChildOrder || null) : undefined;
    const quoteSource = "quoteSource" in body ? (body.quoteSource || null) : undefined;
    const quoteArabic = "quoteArabic" in body ? (body.quoteArabic || null) : undefined;
    const quoteLatin = "quoteLatin" in body ? (body.quoteLatin || null) : undefined;
    const quoteText = "quoteText" in body ? (body.quoteText || null) : undefined;

    // Akad & Resepsi — only update if present in body
    const akadDate = "akadDate" in body ? (body.akadDate ? new Date(body.akadDate) : null) : undefined;
    const akadTime = "akadTime" in body ? (body.akadTime || null) : undefined;
    const akadTimeEnd = "akadTimeEnd" in body ? (body.akadTimeEnd || null) : undefined;
    const akadLocationName = "akadLocationName" in body ? (body.akadLocationName || null) : undefined;
    const akadLocation = "akadLocation" in body ? (body.akadLocation || null) : undefined;
    const akadMapsUrl = "akadMapsUrl" in body ? (body.akadMapsUrl || null) : undefined;
    const resepsiDate = "resepsiDate" in body ? (body.resepsiDate ? new Date(body.resepsiDate) : null) : undefined;
    const resepsiTime = "resepsiTime" in body ? (body.resepsiTime || null) : undefined;
    const resepsiTimeEnd = "resepsiTimeEnd" in body ? (body.resepsiTimeEnd || null) : undefined;
    const resepsiLocationName = "resepsiLocationName" in body ? (body.resepsiLocationName || null) : undefined;
    const resepsiLocation = "resepsiLocation" in body ? (body.resepsiLocation || null) : undefined;
    const resepsiMapsUrl = "resepsiMapsUrl" in body ? (body.resepsiMapsUrl || null) : undefined;

    // OG Image
    const ogImage = "ogImage" in body ? (body.ogImage || null) : undefined;

    // Update title based on new names
    const title = `Pernikahan ${groomName} & ${brideName}`;

    const updatedInvitation = await prisma.invitation.update({
      where: { id },
      data: {
        groomName,
        brideName,
        title,
        groomFather,
        groomMother,
        groomChildOrder,
        brideFather,
        brideMother,
        brideChildOrder,
        eventDate: new Date(eventDate),
        eventTime: eventTime || null,
        location: location || null,
        locationName: locationName || null,
        mapsUrl: mapsUrl || null,
        description: description || null,
        hashtag,
        quoteSource,
        quoteArabic,
        quoteLatin,
        quoteText,
        akadDate,
        akadTime,
        akadTimeEnd,
        akadLocationName,
        akadLocation,
        akadMapsUrl,
        resepsiDate,
        resepsiTime,
        resepsiTimeEnd,
        resepsiLocationName,
        resepsiLocation,
        resepsiMapsUrl,
        ogImage,
      },
    });

    return NextResponse.json({
      message: "Undangan berhasil diperbarui",
      data: updatedInvitation,
    });
  } catch (error) {
    console.error("PUT /api/invitations/[id] error:", error);
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

    // Delete invitation - Prisma cascade (onDelete: Cascade) handles
    // related Gallery, Comments, and GiftAccounts automatically
    await prisma.invitation.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Undangan berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE /api/invitations/[id] error:", error);
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
