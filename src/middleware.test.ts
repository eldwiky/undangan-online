import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock next-auth/jwt
vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn(),
}));

import { getToken } from "next-auth/jwt";
import { middleware } from "./middleware";

const mockedGetToken = vi.mocked(getToken);

function createRequest(path: string, method: string = "GET"): NextRequest {
  return new NextRequest(new URL(path, "http://localhost:3000"), { method });
}

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("public routes (no auth required)", () => {
    it("allows /login without token", async () => {
      mockedGetToken.mockResolvedValue(null);
      const req = createRequest("/login");
      const res = await middleware(req);
      expect(res.status).toBe(200);
    });

    it("allows /register without token", async () => {
      mockedGetToken.mockResolvedValue(null);
      const req = createRequest("/register");
      const res = await middleware(req);
      expect(res.status).toBe(200);
    });

    it("allows /invitation/slug without token", async () => {
      mockedGetToken.mockResolvedValue(null);
      const req = createRequest("/invitation/john-jane");
      const res = await middleware(req);
      expect(res.status).toBe(200);
    });

    it("allows /api/auth routes without token", async () => {
      mockedGetToken.mockResolvedValue(null);
      const req = createRequest("/api/auth/signin");
      const res = await middleware(req);
      expect(res.status).toBe(200);
    });

    it("allows GET /api/invitations/:id/comments without token", async () => {
      mockedGetToken.mockResolvedValue(null);
      const req = createRequest("/api/invitations/123/comments", "GET");
      const res = await middleware(req);
      expect(res.status).toBe(200);
    });
  });

  describe("protected routes (auth required)", () => {
    it("redirects /dashboard to /login when no token", async () => {
      mockedGetToken.mockResolvedValue(null);
      const req = createRequest("/dashboard");
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login");
    });

    it("redirects /dashboard/123/edit to /login when no token", async () => {
      mockedGetToken.mockResolvedValue(null);
      const req = createRequest("/dashboard/123/edit");
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login");
    });

    it("redirects /api/invitations to /login when no token", async () => {
      mockedGetToken.mockResolvedValue(null);
      const req = createRequest("/api/invitations");
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login");
    });

    it("redirects POST /api/invitations/:id/comments to /login when no token", async () => {
      mockedGetToken.mockResolvedValue(null);
      const req = createRequest("/api/invitations/123/comments", "POST");
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login");
    });

    it("includes callbackUrl in redirect", async () => {
      mockedGetToken.mockResolvedValue(null);
      const req = createRequest("/dashboard");
      const res = await middleware(req);
      const location = res.headers.get("location") || "";
      expect(location).toContain("callbackUrl=%2Fdashboard");
    });
  });

  describe("authenticated access", () => {
    it("allows /dashboard with valid token", async () => {
      mockedGetToken.mockResolvedValue({ id: "user-1", email: "test@test.com" } as any);
      const req = createRequest("/dashboard");
      const res = await middleware(req);
      expect(res.status).toBe(200);
    });

    it("allows /api/invitations with valid token", async () => {
      mockedGetToken.mockResolvedValue({ id: "user-1", email: "test@test.com" } as any);
      const req = createRequest("/api/invitations");
      const res = await middleware(req);
      expect(res.status).toBe(200);
    });
  });
});
