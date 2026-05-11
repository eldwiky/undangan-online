import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock bcryptjs
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
  },
}));

import { POST } from "./route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function createRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 when name is too short", async () => {
    const req = createRequest({
      name: "A",
      email: "test@example.com",
      password: "password123",
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation Error");
    expect(data.errors.name).toBeDefined();
  });

  it("should return 400 when email is invalid", async () => {
    const req = createRequest({
      name: "John Doe",
      email: "invalid-email",
      password: "password123",
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation Error");
    expect(data.errors.email).toBeDefined();
  });

  it("should return 400 when password is too short", async () => {
    const req = createRequest({
      name: "John Doe",
      email: "test@example.com",
      password: "12345",
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation Error");
    expect(data.errors.password).toBeDefined();
  });

  it("should return 400 when email already exists", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "existing-id",
      name: "Existing User",
      email: "test@example.com",
      password: "hashed",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = createRequest({
      name: "John Doe",
      email: "test@example.com",
      password: "password123",
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe("Email sudah terdaftar");
  });

  it("should return 201 and create user on valid input", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed_password" as never);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "new-user-id",
      name: "John Doe",
      email: "test@example.com",
      password: "hashed_password",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    });

    const req = createRequest({
      name: "John Doe",
      email: "test@example.com",
      password: "password123",
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe("Registrasi berhasil");
    expect(data.user.id).toBe("new-user-id");
    expect(data.user.name).toBe("John Doe");
    expect(data.user.email).toBe("test@example.com");
    expect(data.user).not.toHaveProperty("password");
  });

  it("should hash password with salt rounds 10", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed_password" as never);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "new-user-id",
      name: "John Doe",
      email: "test@example.com",
      password: "hashed_password",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = createRequest({
      name: "John Doe",
      email: "test@example.com",
      password: "password123",
    });

    await POST(req);

    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
  });

  it("should store hashed password in database, not plaintext", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(bcrypt.hash).mockResolvedValue("$2a$10$hashedvalue" as never);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "new-user-id",
      name: "John Doe",
      email: "test@example.com",
      password: "$2a$10$hashedvalue",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = createRequest({
      name: "John Doe",
      email: "test@example.com",
      password: "password123",
    });

    await POST(req);

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: "John Doe",
        email: "test@example.com",
        password: "$2a$10$hashedvalue",
      },
    });
  });

  it("should return 500 on unexpected error", async () => {
    vi.mocked(prisma.user.findUnique).mockRejectedValue(
      new Error("DB connection failed")
    );

    const req = createRequest({
      name: "John Doe",
      email: "test@example.com",
      password: "password123",
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe("Terjadi kesalahan server");
  });
});
