import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock cloudinary before importing the module
vi.mock("cloudinary", () => {
  const mockUploadStream = {
    end: vi.fn(),
  };

  const mockUploader = {
    upload_stream: vi.fn((options, callback) => {
      // Simulate successful upload
      setTimeout(() => {
        callback(null, {
          secure_url: "https://res.cloudinary.com/test/image/upload/v1/test.jpg",
          public_id: "web-undangan/gallery/test",
        });
      }, 0);
      return mockUploadStream;
    }),
    destroy: vi.fn().mockResolvedValue({ result: "ok" }),
  };

  return {
    v2: {
      config: vi.fn(),
      uploader: mockUploader,
    },
  };
});

import { uploadImage, uploadAudio, deleteFile } from "./cloudinary";

describe("cloudinary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("uploadImage", () => {
    it("should upload an image and return secure_url and public_id", async () => {
      const buffer = Buffer.from("fake-image-data");
      const result = await uploadImage(buffer, "web-undangan/gallery");

      expect(result).toHaveProperty("secure_url");
      expect(result).toHaveProperty("public_id");
      expect(result.secure_url).toContain("https://");
      expect(result.public_id).toBeTruthy();
    });

    it("should use default folder when not specified", async () => {
      const buffer = Buffer.from("fake-image-data");
      const result = await uploadImage(buffer);

      expect(result.secure_url).toBeTruthy();
      expect(result.public_id).toBeTruthy();
    });

    it("should throw an error when upload fails", async () => {
      const { v2 } = await import("cloudinary");
      vi.mocked(v2.uploader.upload_stream).mockImplementationOnce(
        ((options: any, callback: any) => {
          setTimeout(() => {
            callback!(new Error("Upload failed"), undefined);
          }, 0);
          return { end: vi.fn() } as any;
        }) as any
      );

      const buffer = Buffer.from("fake-image-data");
      await expect(uploadImage(buffer)).rejects.toThrow(
        "Cloudinary image upload error"
      );
    });
  });

  describe("uploadAudio", () => {
    it("should upload audio and return secure_url and public_id", async () => {
      const { v2 } = await import("cloudinary");
      vi.mocked(v2.uploader.upload_stream).mockImplementationOnce(
        ((options: any, callback: any) => {
          setTimeout(() => {
            callback!(null, {
              secure_url:
                "https://res.cloudinary.com/test/video/upload/v1/test.mp3",
              public_id: "web-undangan/music/test",
            } as any);
          }, 0);
          return { end: vi.fn() } as any;
        }) as any
      );

      const buffer = Buffer.from("fake-audio-data");
      const result = await uploadAudio(buffer, "web-undangan/music");

      expect(result).toHaveProperty("secure_url");
      expect(result).toHaveProperty("public_id");
      expect(result.secure_url).toContain("https://");
    });

    it("should throw an error when audio upload fails", async () => {
      const { v2 } = await import("cloudinary");
      vi.mocked(v2.uploader.upload_stream).mockImplementationOnce(
        ((options: any, callback: any) => {
          setTimeout(() => {
            callback!(new Error("Audio upload failed"), undefined);
          }, 0);
          return { end: vi.fn() } as any;
        }) as any
      );

      const buffer = Buffer.from("fake-audio-data");
      await expect(uploadAudio(buffer)).rejects.toThrow(
        "Cloudinary audio upload error"
      );
    });
  });

  describe("deleteFile", () => {
    it("should delete a file and return success", async () => {
      const result = await deleteFile("web-undangan/gallery/test");

      expect(result).toEqual({ success: true });
    });

    it("should return success false when file not found", async () => {
      const { v2 } = await import("cloudinary");
      vi.mocked(v2.uploader.destroy).mockResolvedValueOnce({
        result: "not found",
      });

      const result = await deleteFile("nonexistent-id");

      expect(result).toEqual({ success: false });
    });

    it("should throw an error when deletion fails", async () => {
      const { v2 } = await import("cloudinary");
      vi.mocked(v2.uploader.destroy).mockRejectedValueOnce(
        new Error("Network error")
      );

      await expect(deleteFile("some-id")).rejects.toThrow(
        "Cloudinary delete error"
      );
    });

    it("should accept resourceType parameter for audio files", async () => {
      const { v2 } = await import("cloudinary");
      await deleteFile("web-undangan/music/test", "video");

      expect(v2.uploader.destroy).toHaveBeenCalledWith(
        "web-undangan/music/test",
        { resource_type: "video" }
      );
    });
  });
});
