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
      delete: vi.fn(),
    },
  },
}));

import { GET, PUT, DELETE } from "./route";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const mockSession = {
  user: { id: "user-1", name: "Test User", email: "test@example.com" },
};

const mockInvitation = {
  id: "inv-1",
  userId: "user-1",
  groomName: "Budi",
  brideName: "Ani",
  title: "Pernikahan Budi & Ani",
  slug: "budi-ani",
  eventDate: new Date("2025-06-01"),
  eventTime: null,
  location: "Jakarta",
  locationName: "Hotel Grand",
  mapsUrl: null,
  description: "Undangan pernikahan",
  musicUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  gallery: [],
  comments: [],
  giftAccounts: [],
};

function createRequest(method: string, body?: unknown): Request {
  const options: RequestInit = { method };
  if (body) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(body);
  }
  return new Request("http://localhost:3000/api/invitations/inv-1", options);
}

const params = { params: Promise.resolve({ id: "inv-1" }) };

describe("GET /api/invitations/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = createRequest("GET");
    const response = await GET(req, params);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 404 when invitation not found", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(null);

    const req = createRequest("GET");
    const response = await GET(req, params);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Not Found");
  });

  it("should return 403 when user does not own the invitation", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue({
      ...mockInvitation,
      userId: "other-user",
    } as never);

    const req = createRequest("GET");
    const response = await GET(req, params);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Forbidden");
    expect(data.message).toBe("Akses ditolak");
  });

  it("should return invitation with relations when authorized", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);

    const req = createRequest("GET");
    const response = await GET(req, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.id).toBe("inv-1");
    expect(data.data.groomName).toBe("Budi");
  });
});

describe("PUT /api/invitations/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = createRequest("PUT", {
      groomName: "Budi",
      brideName: "Ani",
      eventDate: "2025-06-01T00:00:00.000Z",
    });
    const response = await PUT(req, params);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 404 when invitation not found", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(null);

    const req = createRequest("PUT", {
      groomName: "Budi",
      brideName: "Ani",
      eventDate: "2025-06-01T00:00:00.000Z",
    });
    const response = await PUT(req, params);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Not Found");
  });

  it("should return 403 when user does not own the invitation", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue({
      ...mockInvitation,
      userId: "other-user",
    } as never);

    const req = createRequest("PUT", {
      groomName: "Budi",
      brideName: "Ani",
      eventDate: "2025-06-01T00:00:00.000Z",
    });
    const response = await PUT(req, params);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("should return 400 when validation fails", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);

    const req = createRequest("PUT", {
      groomName: "B", // too short
      brideName: "Ani",
      eventDate: "2025-06-01T00:00:00.000Z",
    });
    const response = await PUT(req, params);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation Error");
  });

  it("should update invitation when authorized and valid", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);
    vi.mocked(prisma.invitation.update).mockResolvedValue({
      ...mockInvitation,
      groomName: "Budi Updated",
      title: "Pernikahan Budi Updated & Ani",
    } as never);

    const req = createRequest("PUT", {
      groomName: "Budi Updated",
      brideName: "Ani",
      eventDate: "2025-06-01T00:00:00.000Z",
    });
    const response = await PUT(req, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Undangan berhasil diperbarui");
    expect(data.data.groomName).toBe("Budi Updated");
  });
});

describe("DELETE /api/invitations/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = createRequest("DELETE");
    const response = await DELETE(req, params);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 404 when invitation not found", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(null);

    const req = createRequest("DELETE");
    const response = await DELETE(req, params);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Not Found");
  });

  it("should return 403 when user does not own the invitation", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue({
      ...mockInvitation,
      userId: "other-user",
    } as never);

    const req = createRequest("DELETE");
    const response = await DELETE(req, params);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("should delete invitation when authorized", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);
    vi.mocked(prisma.invitation.delete).mockResolvedValue(mockInvitation as never);

    const req = createRequest("DELETE");
    const response = await DELETE(req, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Undangan berhasil dihapus");
    expect(prisma.invitation.delete).toHaveBeenCalledWith({
      where: { id: "inv-1" },
    });
  });

  it("should return 500 on unexpected error", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockRejectedValue(new Error("DB error"));

    const req = createRequest("DELETE");
    const response = await DELETE(req, params);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe("Terjadi kesalahan server");
  });
});
