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
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { GET, POST } from "./route";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const mockSession = {
  user: { id: "user-1", name: "Test User", email: "test@example.com" },
};

function createRequest(body?: unknown): Request {
  if (body) {
    return new Request("http://localhost:3000/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }
  return new Request("http://localhost:3000/api/invitations", {
    method: "GET",
  });
}

describe("GET /api/invitations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return list of invitations for authenticated user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    const mockInvitations = [
      {
        id: "inv-1",
        userId: "user-1",
        groomName: "Budi",
        brideName: "Ani",
        title: "Pernikahan Budi & Ani",
        slug: "budi-ani",
        eventDate: new Date("2025-06-01"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    vi.mocked(prisma.invitation.findMany).mockResolvedValue(mockInvitations as never);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].slug).toBe("budi-ani");
  });

  it("should only query invitations for the current user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findMany).mockResolvedValue([]);

    await GET();

    expect(prisma.invitation.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      orderBy: { createdAt: "desc" },
    });
  });

  it("should return 500 on unexpected error", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findMany).mockRejectedValue(new Error("DB error"));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe("Terjadi kesalahan server");
  });
});

describe("POST /api/invitations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = createRequest({
      groomName: "Budi",
      brideName: "Ani",
      eventDate: "2025-06-01T00:00:00.000Z",
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 400 when validation fails", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const req = createRequest({
      groomName: "B", // too short
      brideName: "Ani",
      eventDate: "2025-06-01T00:00:00.000Z",
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation Error");
  });

  it("should create invitation with auto-generated slug and title", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findMany).mockResolvedValue([]);
    vi.mocked(prisma.invitation.create).mockResolvedValue({
      id: "inv-1",
      userId: "user-1",
      groomName: "Budi Santoso",
      brideName: "Ani Wijaya",
      title: "Pernikahan Budi Santoso & Ani Wijaya",
      slug: "budi-santoso-ani-wijaya",
      eventDate: new Date("2025-06-01"),
      eventTime: null,
      location: null,
      locationName: null,
      mapsUrl: null,
      description: null,
      musicUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const req = createRequest({
      groomName: "Budi Santoso",
      brideName: "Ani Wijaya",
      eventDate: "2025-06-01T00:00:00.000Z",
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe("Undangan berhasil dibuat");
    expect(data.data.slug).toBe("budi-santoso-ani-wijaya");
    expect(data.data.title).toBe("Pernikahan Budi Santoso & Ani Wijaya");
  });

  it("should ensure unique slug when duplicate exists", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findMany).mockResolvedValue([
      { slug: "budi-ani" },
    ] as never);
    vi.mocked(prisma.invitation.create).mockResolvedValue({
      id: "inv-2",
      userId: "user-1",
      groomName: "Budi",
      brideName: "Ani",
      title: "Pernikahan Budi & Ani",
      slug: "budi-ani-1",
      eventDate: new Date("2025-06-01"),
      eventTime: null,
      location: null,
      locationName: null,
      mapsUrl: null,
      description: null,
      musicUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const req = createRequest({
      groomName: "Budi",
      brideName: "Ani",
      eventDate: "2025-06-01T00:00:00.000Z",
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data.slug).toBe("budi-ani-1");
  });

  it("should return 500 on unexpected error", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findMany).mockRejectedValue(new Error("DB error"));

    const req = createRequest({
      groomName: "Budi",
      brideName: "Ani",
      eventDate: "2025-06-01T00:00:00.000Z",
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe("Terjadi kesalahan server");
  });
});
