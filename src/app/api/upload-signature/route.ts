import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { folder } = body;

    const timestamp = Math.round(new Date().getTime() / 1000);

    const paramsToSign: Record<string, string | number> = {
      timestamp,
      folder: folder || "web-undangan",
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: folder || "web-undangan",
    });
  } catch (error) {
    console.error("Upload signature error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Gagal membuat signature" },
      { status: 500 }
    );
  }
}
