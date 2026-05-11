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
    giftAccount: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
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

const mockGiftAccount = {
  id: "account-1",
  invitationId: "inv-1",
  bankName: "BCA",
  accountNumber: "1234567890",
  accountHolder: "John Doe",
  qrisUrl: null,
  createdAt: new Date(),
};

const mockGiftAccountWithQris = {
  id: "account-2",
  invitationId: "inv-1",
  bankName: "Mandiri",
  accountNumber: "0987654321",
  accountHolder: "Jane Doe",
  qrisUrl: "https://res.cloudinary.com/demo/image/upload/v1234/web-undangan/qris/inv-1/qris.png",
  createdAt: new Date(),
};

const params = { params: Promise.resolve({ id: "inv-1" }) };

function createJsonRequest(body: object): Request {
  return new Request("http://localhost:3000/api/invitations/inv-1/gift-accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function createFormDataRequest(fields: Record<string, string>, file?: File): Request {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  if (file) {
    formData.append("qrisImage", file);
  }
  return new Request("http://localhost:3000/api/invitations/inv-1/gift-accounts", {
    method: "POST",
    body: formData,
  });
}

function createDeleteRequest(accountId?: string): Request {
  const url = accountId
    ? `http://localhost:3000/api/invitations/inv-1/gift-accounts?accountId=${accountId}`
    : "http://localhost:3000/api/invitations/inv-1/gift-accounts";
  return new Request(url, { method: "DELETE" });
}

describe("GET /api/invitations/[id]/gift-accounts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = new Request("http://localhost:3000/api/invitations/inv-1/gift-accounts");
    const response = await GET(req, params);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 404 when invitation not found", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(null);

    const req = new Request("http://localhost:3000/api/invitations/inv-1/gift-accounts");
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

    const req = new Request("http://localhost:3000/api/invitations/inv-1/gift-accounts");
    const response = await GET(req, params);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("should return gift accounts when authorized", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);
    vi.mocked(prisma.giftAccount.findMany).mockResolvedValue([mockGiftAccount] as never);

    const req = new Request("http://localhost:3000/api/invitations/inv-1/gift-accounts");
    const response = await GET(req, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].id).toBe("account-1");
    expect(data.data[0].bankName).toBe("BCA");
  });
});

describe("POST /api/invitations/[id]/gift-accounts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = createJsonRequest({
      bankName: "BCA",
      accountNumber: "1234567890",
      accountHolder: "John Doe",
    });
    const response = await POST(req, params);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 404 when invitation not found", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(null);

    const req = createJsonRequest({
      bankName: "BCA",
      accountNumber: "1234567890",
      accountHolder: "John Doe",
    });
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

    const req = createJsonRequest({
      bankName: "BCA",
      accountNumber: "1234567890",
      accountHolder: "John Doe",
    });
    const response = await POST(req, params);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("should return 400 when validation fails (JSON body)", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);

    const req = createJsonRequest({
      bankName: "",
      accountNumber: "",
      accountHolder: "",
    });
    const response = await POST(req, params);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation Error");
  });

  it("should create gift account with JSON body (no QRIS)", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);
    vi.mocked(prisma.giftAccount.create).mockResolvedValue(mockGiftAccount as never);

    const req = createJsonRequest({
      bankName: "BCA",
      accountNumber: "1234567890",
      accountHolder: "John Doe",
    });
    const response = await POST(req, params);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe("Rekening hadiah berhasil ditambahkan");
    expect(data.data.bankName).toBe("BCA");
    expect(prisma.giftAccount.create).toHaveBeenCalledWith({
      data: {
        invitationId: "inv-1",
        bankName: "BCA",
        accountNumber: "1234567890",
        accountHolder: "John Doe",
        qrisUrl: null,
      },
    });
  });

  it("should return 400 when validation fails (FormData)", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);

    const req = createFormDataRequest({
      bankName: "",
      accountNumber: "",
      accountHolder: "",
    });
    const response = await POST(req, params);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation Error");
  });

  it("should return 415 when QRIS file type is not allowed", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);

    const file = new File(["test"], "qris.pdf", { type: "application/pdf" });
    const req = createFormDataRequest(
      {
        bankName: "BCA",
        accountNumber: "1234567890",
        accountHolder: "John Doe",
      },
      file
    );
    const response = await POST(req, params);
    const data = await response.json();

    expect(response.status).toBe(415);
    expect(data.error).toBe("Unsupported Media Type");
  });

  it("should create gift account with QRIS image via FormData", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);
    vi.mocked(uploadImage).mockResolvedValue({
      secure_url: "https://res.cloudinary.com/demo/image/upload/v1234/web-undangan/qris/inv-1/qris.png",
      public_id: "web-undangan/qris/inv-1/qris",
    });
    vi.mocked(prisma.giftAccount.create).mockResolvedValue(mockGiftAccountWithQris as never);

    const file = new File(["qris-image-data"], "qris.png", { type: "image/png" });
    const req = createFormDataRequest(
      {
        bankName: "Mandiri",
        accountNumber: "0987654321",
        accountHolder: "Jane Doe",
      },
      file
    );
    const response = await POST(req, params);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe("Rekening hadiah berhasil ditambahkan");
    expect(uploadImage).toHaveBeenCalled();
    expect(prisma.giftAccount.create).toHaveBeenCalledWith({
      data: {
        invitationId: "inv-1",
        bankName: "Mandiri",
        accountNumber: "0987654321",
        accountHolder: "Jane Doe",
        qrisUrl: "https://res.cloudinary.com/demo/image/upload/v1234/web-undangan/qris/inv-1/qris.png",
      },
    });
  });
});

describe("DELETE /api/invitations/[id]/gift-accounts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = createDeleteRequest("account-1");
    const response = await DELETE(req, params);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 404 when invitation not found", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(null);

    const req = createDeleteRequest("account-1");
    const response = await DELETE(req, params);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Not Found");
  });

  it("should return 403 when user does not own the invitation", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue({
      userId: "other-user",
    } as never);

    const req = createDeleteRequest("account-1");
    const response = await DELETE(req, params);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("should return 400 when accountId is not provided", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);

    const req = createDeleteRequest(); // no accountId
    const response = await DELETE(req, params);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation Error");
    expect(data.message).toContain("accountId");
  });

  it("should return 404 when gift account not found", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);
    vi.mocked(prisma.giftAccount.findFirst).mockResolvedValue(null);

    const req = createDeleteRequest("nonexistent-account");
    const response = await DELETE(req, params);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.message).toBe("Rekening hadiah tidak ditemukan");
  });

  it("should delete gift account without QRIS image", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);
    vi.mocked(prisma.giftAccount.findFirst).mockResolvedValue(mockGiftAccount as never);
    vi.mocked(prisma.giftAccount.delete).mockResolvedValue(mockGiftAccount as never);

    const req = createDeleteRequest("account-1");
    const response = await DELETE(req, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Rekening hadiah berhasil dihapus");
    expect(deleteFile).not.toHaveBeenCalled();
    expect(prisma.giftAccount.delete).toHaveBeenCalledWith({
      where: { id: "account-1" },
    });
  });

  it("should delete gift account and QRIS image from Cloudinary", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);
    vi.mocked(prisma.giftAccount.findFirst).mockResolvedValue(mockGiftAccountWithQris as never);
    vi.mocked(deleteFile).mockResolvedValue({ success: true });
    vi.mocked(prisma.giftAccount.delete).mockResolvedValue(mockGiftAccountWithQris as never);

    const req = createDeleteRequest("account-2");
    const response = await DELETE(req, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Rekening hadiah berhasil dihapus");
    expect(deleteFile).toHaveBeenCalledWith(
      "web-undangan/qris/inv-1/qris",
      "image"
    );
    expect(prisma.giftAccount.delete).toHaveBeenCalledWith({
      where: { id: "account-2" },
    });
  });

  it("should still delete from database even if Cloudinary deletion fails", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation as never);
    vi.mocked(prisma.giftAccount.findFirst).mockResolvedValue(mockGiftAccountWithQris as never);
    vi.mocked(deleteFile).mockRejectedValue(new Error("Cloudinary error"));
    vi.mocked(prisma.giftAccount.delete).mockResolvedValue(mockGiftAccountWithQris as never);

    const req = createDeleteRequest("account-2");
    const response = await DELETE(req, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Rekening hadiah berhasil dihapus");
    expect(prisma.giftAccount.delete).toHaveBeenCalled();
  });
});
