import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

/**
 * Upload an image to Cloudinary with auto quality and format optimization.
 * @param file - Buffer of the image file
 * @param folder - Cloudinary folder path (e.g., "web-undangan/gallery")
 */
export async function uploadImage(
  file: Buffer,
  folder: string = "web-undangan/gallery"
): Promise<CloudinaryUploadResult> {
  try {
    const result = await new Promise<CloudinaryUploadResult>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: "image",
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }
            if (!result) {
              reject(new Error("Upload failed: no result returned"));
              return;
            }
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          }
        );
        uploadStream.end(file);
      }
    );
    return result;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Image upload failed";
    throw new Error(`Cloudinary image upload error: ${message}`);
  }
}

/**
 * Upload an audio file (MP3) to Cloudinary.
 * @param file - Buffer of the audio file
 * @param folder - Cloudinary folder path (e.g., "web-undangan/music")
 */
export async function uploadAudio(
  file: Buffer,
  folder: string = "web-undangan/music"
): Promise<CloudinaryUploadResult> {
  try {
    const result = await new Promise<CloudinaryUploadResult>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: "video", // Cloudinary uses "video" resource_type for audio files
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }
            if (!result) {
              reject(new Error("Upload failed: no result returned"));
              return;
            }
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          }
        );
        uploadStream.end(file);
      }
    );
    return result;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Audio upload failed";
    throw new Error(`Cloudinary audio upload error: ${message}`);
  }
}

/**
 * Delete a file from Cloudinary by its public_id.
 * @param publicId - The public_id of the file to delete
 * @param resourceType - The resource type ("image" or "video" for audio)
 */
export async function deleteFile(
  publicId: string,
  resourceType: "image" | "video" = "image"
): Promise<{ success: boolean }> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return { success: result.result === "ok" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "File deletion failed";
    throw new Error(`Cloudinary delete error: ${message}`);
  }
}

export default cloudinary;
