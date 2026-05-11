import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next-auth
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

// Mock auth options
vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    invitation: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock cloudinary
vi.mock("@/lib/cloudinary", () => ({
  uploadAudio: vi.fn(),
  deleteFile: vi.fn(),
}));

import { POST, DELETE } from "./route";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { uploadAudio, deleteFile } from "@/lib/cloudinary";

const mockSession = {
  user: { id: "user-1", name: "Test User", email: "test@example.com" },
};

const mockInvitation = {
  userId: "user-1",
  musicUrl: null,
};

const mockInvitationWithMusic = {
  userId: "user-1",
  musicUrl:
    "https://res.cloudinary.com/demo/video/upload/v1234/web-undangan/music/inv-1/song.mp3",
};

const params = { params: Promise.resolve({ id: "inv-1" }) };

function createFormDataRequest(file?: File): Request {
  const formData = new FormData();
  if (file) {
    formData.append("file", file);
  }
  return new Request("http://localhost:3000/api/invitations/inv-1/music", {
    method: "POST",
    body: formData,
  });
}

function createDeleteRequest(): Request {
  return new Request("http://localhost:3000/api/invitations/inv-1/music", {
    method: "DELETE",
  });
}

describe("POST /api/invitations/[id]/music", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const file = new File(["audio-data"], "song.mp3", { type: "audio/mpeg" });
    const req = createFormDataRequest(file);
    const response = await POST(req, params);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 404 when invitation not found", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(null);

    const file = new File(["audio-data"], "song.mp3", { type: "audio/mpeg" });
    const req = createFormDataRequest(file);
    const response = await POST(req, params);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Not Found");
  });

  it("should return 403 when user does not own the invitation", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue({
      userId: "other-user",
    } as never);

    const file = new File(["audio-data"], "song.mp3", { type: "audio/mpeg" });
    const req = createFormDataRequest(file);
    const response = await POST(req, params);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("should return 400 when no file is provided", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(
      mockInvitation as never
    );

    const req = createFormDataRequest(); // no file
    const response = await POST(req, params);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation Error");
    expect(data.message).toContain("musik");
  });

  it("should return 415 when file type is not MP3", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(
      mockInvitation as never
    );

    const file = new File(["audio-data"], "song.wav", { type: "audio/wav" });
    const req = createFormDataRequest(file);
    const response = await POST(req, params);
    const data = await response.json();

    expect(response.status).toBe(415);
    expect(data.error).toBe("Unsupported Media Type");
    expect(data.message).toContain("MP3");
  });

  it("should return 413 when file size exceeds 10MB", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(
      mockInvitation as never
    );

    // Create a file that reports size > 10MB
    const largeContent = new Uint8Array(11 * 1024 * 1024); // 11MB
    const file = new File([largeContent], "large-song.mp3", {
      type: "audio/mpeg",
    });
    const req = createFormDataRequest(file);
    const response = await POST(req, params);
    const data = await response.json();

    expect(response.status).toBe(413);
    expect(data.error).toBe("Payload Too Large");
    expect(data.message).toContain("10MB");
  });

  it("should upload music and return 201 on success", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(
      mockInvitation as never
    );
    vi.mocked(uploadAudio).mockResolvedValue({
      secure_url:
        "https://res.cloudinary.com/demo/video/upload/v1234/web-undangan/music/inv-1/song.mp3",
      public_id: "web-undangan/music/inv-1/song",
    });
    vi.mocked(prisma.invitation.update).mockResolvedValue({
      id: "inv-1",
      musicUrl:
        "https://res.cloudinary.com/demo/video/upload/v1234/web-undangan/music/inv-1/song.mp3",
    } as never);

    const file = new File(["audio-data"], "song.mp3", { type: "audio/mpeg" });
    const req = createFormDataRequest(file);
    const response = await POST(req, params);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe("Musik berhasil diunggah");
    expect(data.data.musicUrl).toContain("cloudinary.com");
    expect(uploadAudio).toHaveBeenCalled();
    expect(prisma.invitation.update).toHaveBeenCalledWith({
      where: { id: "inv-1" },
      data: {
        musicUrl:
          "https://res.cloudinary.com/demo/video/upload/v1234/web-undangan/music/inv-1/song.mp3",
      },
      select: { id: true, musicUrl: true },
    });
  });

  it("should return 500 on unexpected error", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockRejectedValue(
      new Error("DB error")
    );

    const file = new File(["audio-data"], "song.mp3", { type: "audio/mpeg" });
    const req = createFormDataRequest(file);
    const response = await POST(req, params);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal Server Error");
  });
});

describe("DELETE /api/invitations/[id]/music", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = createDeleteRequest();
    const response = await DELETE(req, params);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 404 when invitation not found", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(null);

    const req = createDeleteRequest();
    const response = await DELETE(req, params);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Not Found");
  });

  it("should return 403 when user does not own the invitation", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue({
      userId: "other-user",
      musicUrl: "https://example.com/song.mp3",
    } as never);

    const req = createDeleteRequest();
    const response = await DELETE(req, params);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("should return 404 when no music is uploaded", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(
      mockInvitation as never
    );

    const req = createDeleteRequest();
    const response = await DELETE(req, params);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.message).toContain("musik");
  });

  it("should delete music from Cloudinary and update database on success", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(
      mockInvitationWithMusic as never
    );
    vi.mocked(deleteFile).mockResolvedValue({ success: true });
    vi.mocked(prisma.invitation.update).mockResolvedValue({
      id: "inv-1",
      musicUrl: null,
    } as never);

    const req = createDeleteRequest();
    const response = await DELETE(req, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Musik berhasil dihapus");
    expect(deleteFile).toHaveBeenCalledWith(
      "web-undangan/music/inv-1/song",
      "video"
    );
    expect(prisma.invitation.update).toHaveBeenCalledWith({
      where: { id: "inv-1" },
      data: { musicUrl: null },
    });
  });

  it("should still update database even if Cloudinary deletion fails", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(
      mockInvitationWithMusic as never
    );
    vi.mocked(deleteFile).mockRejectedValue(new Error("Cloudinary error"));
    vi.mocked(prisma.invitation.update).mockResolvedValue({
      id: "inv-1",
      musicUrl: null,
    } as never);

    const req = createDeleteRequest();
    const response = await DELETE(req, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Musik berhasil dihapus");
    expect(prisma.invitation.update).toHaveBeenCalled();
  });

  it("should return 500 on unexpected error", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockRejectedValue(
      new Error("DB error")
    );

    const req = createDeleteRequest();
    const response = await DELETE(req, params);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal Server Error");
  });
});
