import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    invitation: {
      findUnique: vi.fn(),
    },
    comment: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock rate limiter
vi.mock("@/lib/rate-limiter", () => ({
  checkRateLimit: vi.fn(),
}));

import { GET, POST } from "./route";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limiter";

const mockInvitation = { id: "inv-1" };

const mockComment = {
  id: "comment-1",
  invitationId: "inv-1",
  guestName: "Budi",
  message: "Selamat menempuh hidup baru!",
  attendance: "hadir",
  createdAt: new Date("2024-01-15T10:00:00Z"),
};

const params = { params: Promise.resolve({ id: "inv-1" }) };

function createGetRequest(page?: number): Request {
  const url = page
    ? `http://localhost:3000/api/invitations/inv-1/comments?page=${page}`
    : "http://localhost:3000/api/invitations/inv-1/comments";
  return new Request(url, { method: "GET" });
}

function createPostRequest(body: object, ip?: string): Request {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (ip) {
    headers["x-forwarded-for"] = ip;
  }
  return new Request("http://localhost:3000/api/invitations/inv-1/comments", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe("GET /api/invitations/[id]/comments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 404 when invitation not found", async () => {
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(null);

    const req = createGetRequest();
    const response = await GET(req, params);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Not Found");
    expect(data.message).toBe("Undangan tidak ditemukan");
  });

  it("should return paginated comments sorted by newest", async () => {
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);
    vi.mocked(prisma.comment.findMany).mockResolvedValue([mockComment] as never);
    vi.mocked(prisma.comment.count).mockResolvedValue(1);

    const req = createGetRequest();
    const response = await GET(req, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].guestName).toBe("Budi");
    expect(data.pagination).toEqual({
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    });

    expect(prisma.comment.findMany).toHaveBeenCalledWith({
      where: { invitationId: "inv-1" },
      orderBy: { createdAt: "desc" },
      skip: 0,
      take: 10,
    });
  });

  it("should handle page parameter correctly", async () => {
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);
    vi.mocked(prisma.comment.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.comment.count).mockResolvedValue(25);

    const req = createGetRequest(3);
    const response = await GET(req, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination).toEqual({
      page: 3,
      pageSize: 10,
      total: 25,
      totalPages: 3,
    });

    expect(prisma.comment.findMany).toHaveBeenCalledWith({
      where: { invitationId: "inv-1" },
      orderBy: { createdAt: "desc" },
      skip: 20,
      take: 10,
    });
  });

  it("should default to page 1 when invalid page is provided", async () => {
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);
    vi.mocked(prisma.comment.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.comment.count).mockResolvedValue(0);

    const req = new Request(
      "http://localhost:3000/api/invitations/inv-1/comments?page=-1"
    );
    const response = await GET(req, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination.page).toBe(1);

    expect(prisma.comment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0 })
    );
  });
});

describe("POST /api/invitations/[id]/comments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: true, remaining: 2 });
  });

  it("should return 404 when invitation not found", async () => {
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(null);

    const req = createPostRequest({
      guestName: "Budi",
      message: "Selamat!",
      attendance: "hadir",
    });
    const response = await POST(req, params);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Not Found");
  });

  it("should return 429 when rate limited", async () => {
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: false, remaining: 0 });

    const req = createPostRequest(
      { guestName: "Budi", message: "Selamat!", attendance: "hadir" },
      "192.168.1.1"
    );
    const response = await POST(req, params);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toBe("Too Many Requests");
    expect(data.message).toBe("Terlalu banyak pesan, coba lagi nanti");
  });

  it("should return 400 when validation fails", async () => {
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);

    const req = createPostRequest({
      guestName: "",
      message: "",
      attendance: "invalid",
    });
    const response = await POST(req, params);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation Error");
  });

  it("should create comment with sanitized input", async () => {
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);
    vi.mocked(prisma.comment.create).mockResolvedValue(mockComment as never);

    const req = createPostRequest({
      guestName: "Budi",
      message: "Selamat menempuh hidup baru!",
      attendance: "hadir",
    });
    const response = await POST(req, params);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe("Ucapan berhasil dikirim");
    expect(data.data.guestName).toBe("Budi");
    expect(prisma.comment.create).toHaveBeenCalledWith({
      data: {
        invitationId: "inv-1",
        guestName: "Budi",
        message: "Selamat menempuh hidup baru!",
        attendance: "hadir",
      },
    });
  });

  it("should sanitize XSS in guestName and message", async () => {
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);
    vi.mocked(prisma.comment.create).mockResolvedValue({
      ...mockComment,
      guestName: "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;",
      message: "&lt;b&gt;bold&lt;/b&gt;",
    } as never);

    const req = createPostRequest({
      guestName: "<script>alert('xss')</script>",
      message: "<b>bold</b>",
      attendance: "hadir",
    });
    const response = await POST(req, params);

    expect(response.status).toBe(201);
    expect(prisma.comment.create).toHaveBeenCalledWith({
      data: {
        invitationId: "inv-1",
        guestName: "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;",
        message: "&lt;b&gt;bold&lt;/b&gt;",
        attendance: "hadir",
      },
    });
  });

  it("should extract IP from x-forwarded-for header", async () => {
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);
    vi.mocked(prisma.comment.create).mockResolvedValue(mockComment as never);

    const req = createPostRequest(
      { guestName: "Budi", message: "Selamat!", attendance: "hadir" },
      "10.0.0.1, 192.168.1.1"
    );
    await POST(req, params);

    expect(checkRateLimit).toHaveBeenCalledWith("10.0.0.1", 3, 60000);
  });

  it("should use x-real-ip when x-forwarded-for is not available", async () => {
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);
    vi.mocked(prisma.comment.create).mockResolvedValue(mockComment as never);

    const req = new Request(
      "http://localhost:3000/api/invitations/inv-1/comments",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-real-ip": "172.16.0.1",
        },
        body: JSON.stringify({
          guestName: "Budi",
          message: "Selamat!",
          attendance: "hadir",
        }),
      }
    );
    await POST(req, params);

    expect(checkRateLimit).toHaveBeenCalledWith("172.16.0.1", 3, 60000);
  });

  it("should fallback to 'unknown' when no IP headers present", async () => {
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);
    vi.mocked(prisma.comment.create).mockResolvedValue(mockComment as never);

    const req = new Request(
      "http://localhost:3000/api/invitations/inv-1/comments",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: "Budi",
          message: "Selamat!",
          attendance: "hadir",
        }),
      }
    );
    await POST(req, params);

    expect(checkRateLimit).toHaveBeenCalledWith("unknown", 3, 60000);
  });
});
