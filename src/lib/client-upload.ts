interface UploadResult {
  secure_url: string;
  public_id: string;
}

/**
 * Upload a file directly from the browser to Cloudinary using signed upload.
 * This bypasses Vercel's 4.5MB request body limit by uploading directly
 * from the client to Cloudinary's API.
 *
 * @param file - The File object to upload
 * @param folder - Cloudinary folder path (e.g., "web-undangan/music/abc123")
 * @param resourceType - "image" for photos, "video" for audio/music files
 */
export async function uploadToCloudinary(
  file: File,
  folder: string,
  resourceType: "image" | "video" = "image"
): Promise<UploadResult> {
  // 1. Get signature from our API (tiny JSON request, no size limit issue)
  const sigRes = await fetch("/api/upload-signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder, resourceType }),
  });

  if (!sigRes.ok) {
    throw new Error("Gagal mendapatkan signature upload");
  }

  const { signature, timestamp, cloudName, apiKey, folder: signedFolder } =
    await sigRes.json();

  // 2. Upload directly to Cloudinary (browser → Cloudinary, no Vercel limit)
  const formData = new FormData();
  formData.append("file", file);
  formData.append("signature", signature);
  formData.append("timestamp", String(timestamp));
  formData.append("api_key", apiKey);
  formData.append("folder", signedFolder);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`Upload gagal: ${err}`);
  }

  const data = await uploadRes.json();
  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
  };
}
