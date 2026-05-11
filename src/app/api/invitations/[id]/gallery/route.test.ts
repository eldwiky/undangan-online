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
    },
    gallery: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock cloudinary
vi.mock("@/lib/cloudinary", () => ({
  uploadImage: vi.fn(),
  deleteFile: vi.fn(),
}));

import { GET, POST, DELETE } from "./route";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { uploadImage, deleteFile } from "@/lib/cloudinary";

const mockSession = {
  user: { id: "user-1", name: "Test User", email: "test@example.com" },
};

const mockInvitation = {
  userId: "user-1",
};

const mockGalleryItem = {
  id: "photo-1",
  invitationId: "inv-1",
  imageUrl: "https://res.cloudinary.com/demo/image/upload/v1234/web-undangan/gallery/inv-1/photo.jpg",
  order: 0,
  createdAt: new Date(),
};

const params = { params: Promise.resolve({ id: "inv-1" }) };

function createFormDataRequest(file?: File): Request {
  const formData = new FormData();
  if (file) {
    formData.append("file", file);
  }
  return new Request("http://localhost:3000/api/invitations/inv-1/gallery", {
    method: "POST",
    body: formData,
  });
}

function createDeleteRequest(photoId?: string): Request {
  const url = photoId
    ? `http://localhost:3000/api/invitations/inv-1/gallery?photoId=${photoId}`
    : "http://localhost:3000/api/invitations/inv-1/gallery";
  return new Request(url, { method: "DELETE" });
}

describe("GET /api/invitations/[id]/gallery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = new Request("http://localhost:3000/api/invitations/inv-1/gallery");
    const response = await GET(req, params);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 404 when invitation not found", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(null);

    const req = new Request("http://localhost:3000/api/invitations/inv-1/gallery");
    const response = await GET(req, params);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Not Found");
  });

  it("should return 403 when user does not own the invitation", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue({
      userId: "other-user",
    } as never);

    const req = new Request("http://localhost:3000/api/invitations/inv-1/gallery");
    const response = await GET(req, params);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("should return gallery items when authorized", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);
    vi.mocked(prisma.gallery.findMany).mockResolvedValue([mockGalleryItem] as never);

    const req = new Request("http://localhost:3000/api/invitations/inv-1/gallery");
    const response = await GET(req, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].id).toBe("photo-1");
  });
});

describe("POST /api/invitations/[id]/gallery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const file = new File(["test"], "photo.jpg", { type: "image/jpeg" });
    const req = createFormDataRequest(file);
    const response = await POST(req, params);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 404 when invitation not found", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(null);

    const file = new File(["test"], "photo.jpg", { type: "image/jpeg" });
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

    const file = new File(["test"], "photo.jpg", { type: "image/jpeg" });
    const req = createFormDataRequest(file);
    const response = await POST(req, params);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("should return 413 when gallery has reached max count", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);
    vi.mocked(prisma.gallery.count).mockResolvedValue(20);

    const file = new File(["test"], "photo.jpg", { type: "image/jpeg" });
    const req = createFormDataRequest(file);
    const response = await POST(req, params);
    const data = await response.json();

    expect(response.status).toBe(413);
    expect(data.error).toBe("Payload Too Large");
    expect(data.message).toContain("20");
  });

  it("should return 400 when no file is provided", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);
    vi.mocked(prisma.gallery.count).mockResolvedValue(0);

    const req = createFormDataRequest(); // no file
    const response = await POST(req, params);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation Error");
  });

  it("should return 415 when file type is not allowed", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);
    vi.mocked(prisma.gallery.count).mockResolvedValue(0);

    const file = new File(["test"], "document.pdf", { type: "application/pdf" });
    const req = createFormDataRequest(file);
    const response = await POST(req, params);
    const data = await response.json();

    expect(response.status).toBe(415);
    expect(data.error).toBe("Unsupported Media Type");
  });

  it("should upload photo and return 201 on success", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);
    vi.mocked(prisma.gallery.count).mockResolvedValue(5);
    vi.mocked(uploadImage).mockResolvedValue({
      secure_url: "https://res.cloudinary.com/demo/image/upload/v1234/web-undangan/gallery/inv-1/photo.jpg",
      public_id: "web-undangan/gallery/inv-1/photo",
    });
    vi.mocked(prisma.gallery.create).mockResolvedValue({
      id: "new-photo-1",
      invitationId: "inv-1",
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1234/web-undangan/gallery/inv-1/photo.jpg",
      order: 5,
      createdAt: new Date(),
    } as never);

    const file = new File(["test-image-data"], "photo.jpg", { type: "image/jpeg" });
    const req = createFormDataRequest(file);
    const response = await POST(req, params);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe("Foto berhasil diunggah");
    expect(data.data.id).toBe("new-photo-1");
    expect(uploadImage).toHaveBeenCalled();
  });
});

describe("DELETE /api/invitations/[id]/gallery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = createDeleteRequest("photo-1");
    const response = await DELETE(req, params);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 404 when invitation not found", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(null);

    const req = createDeleteRequest("photo-1");
    const response = await DELETE(req, params);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Not Found");
  });

  it("should return 400 when photoId is not provided", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);

    const req = createDeleteRequest(); // no photoId
    const response = await DELETE(req, params);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation Error");
    expect(data.message).toContain("photoId");
  });

  it("should return 404 when photo not found in gallery", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);
    vi.mocked(prisma.gallery.findFirst).mockResolvedValue(null);

    const req = createDeleteRequest("nonexistent-photo");
    const response = await DELETE(req, params);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.message).toBe("Foto tidak ditemukan");
  });

  it("should delete photo from Cloudinary and database on success", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);
    vi.mocked(prisma.gallery.findFirst).mockResolvedValue(mockGalleryItem as never);
    vi.mocked(deleteFile).mockResolvedValue({ success: true });
    vi.mocked(prisma.gallery.delete).mockResolvedValue(mockGalleryItem as never);

    const req = createDeleteRequest("photo-1");
    const response = await DELETE(req, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Foto berhasil dihapus");
    expect(deleteFile).toHaveBeenCalledWith(
      "web-undangan/gallery/inv-1/photo",
      "image"
    );
    expect(prisma.gallery.delete).toHaveBeenCalledWith({
      where: { id: "photo-1" },
    });
  });

  it("should still delete from database even if Cloudinary deletion fails", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);
    vi.mocked(prisma.gallery.findFirst).mockResolvedValue(mockGalleryItem as never);
    vi.mocked(deleteFile).mockRejectedValue(new Error("Cloudinary error"));
    vi.mocked(prisma.gallery.delete).mockResolvedValue(mockGalleryItem as never);

    const req = createDeleteRequest("photo-1");
    const response = await DELETE(req, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Foto berhasil dihapus");
    expect(prisma.gallery.delete).toHaveBeenCalled();
  });
});
