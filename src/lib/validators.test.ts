import { describe, it, expect } from "vitest";
import {
  registerSchema,
  invitationSchema,
  commentSchema,
  giftAccountSchema,
  sanitizeInput,
  validateFileType,
  validateFileSize,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_MUSIC_TYPES,
  MAX_MUSIC_SIZE,
  MAX_GALLERY_COUNT,
} from "./validators";

// === registerSchema ===

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 2 characters", () => {
    const result = registerSchema.safeParse({
      name: "J",
      email: "john@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const result = registerSchema.safeParse({
      name: "John",
      email: "not-an-email",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 6 characters", () => {
    const result = registerSchema.safeParse({
      name: "John",
      email: "john@example.com",
      password: "12345",
    });
    expect(result.success).toBe(false);
  });
});

// === invitationSchema ===

describe("invitationSchema", () => {
  it("accepts valid invitation data", () => {
    const result = invitationSchema.safeParse({
      groomName: "Ahmad",
      brideName: "Siti",
      eventDate: "2025-12-25T10:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("accepts invitation with all optional fields", () => {
    const result = invitationSchema.safeParse({
      groomName: "Ahmad",
      brideName: "Siti",
      eventDate: "2025-12-25T10:00:00.000Z",
      eventTime: "10:00",
      location: "Jakarta",
      locationName: "Hotel Grand",
      mapsUrl: "https://maps.google.com/test",
      description: "Wedding ceremony",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty string for mapsUrl", () => {
    const result = invitationSchema.safeParse({
      groomName: "Ahmad",
      brideName: "Siti",
      eventDate: "2025-12-25T10:00:00.000Z",
      mapsUrl: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects groomName shorter than 2 characters", () => {
    const result = invitationSchema.safeParse({
      groomName: "A",
      brideName: "Siti",
      eventDate: "2025-12-25T10:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });

  it("rejects brideName shorter than 2 characters", () => {
    const result = invitationSchema.safeParse({
      groomName: "Ahmad",
      brideName: "S",
      eventDate: "2025-12-25T10:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid datetime format for eventDate", () => {
    const result = invitationSchema.safeParse({
      groomName: "Ahmad",
      brideName: "Siti",
      eventDate: "not-a-date",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid URL for mapsUrl", () => {
    const result = invitationSchema.safeParse({
      groomName: "Ahmad",
      brideName: "Siti",
      eventDate: "2025-12-25T10:00:00.000Z",
      mapsUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });
});

// === commentSchema ===

describe("commentSchema", () => {
  it("accepts valid comment data", () => {
    const result = commentSchema.safeParse({
      guestName: "Budi",
      message: "Selamat menempuh hidup baru!",
      attendance: "hadir",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all attendance values", () => {
    for (const attendance of ["hadir", "tidak_hadir", "ragu"]) {
      const result = commentSchema.safeParse({
        guestName: "Budi",
        message: "Selamat!",
        attendance,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects empty guestName", () => {
    const result = commentSchema.safeParse({
      guestName: "",
      message: "Selamat!",
      attendance: "hadir",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty message", () => {
    const result = commentSchema.safeParse({
      guestName: "Budi",
      message: "",
      attendance: "hadir",
    });
    expect(result.success).toBe(false);
  });

  it("rejects message longer than 500 characters", () => {
    const result = commentSchema.safeParse({
      guestName: "Budi",
      message: "a".repeat(501),
      attendance: "hadir",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid attendance value", () => {
    const result = commentSchema.safeParse({
      guestName: "Budi",
      message: "Selamat!",
      attendance: "mungkin",
    });
    expect(result.success).toBe(false);
  });
});

// === giftAccountSchema ===

describe("giftAccountSchema", () => {
  it("accepts valid gift account data", () => {
    const result = giftAccountSchema.safeParse({
      bankName: "BCA",
      accountNumber: "1234567890",
      accountHolder: "Ahmad Fauzi",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty bankName", () => {
    const result = giftAccountSchema.safeParse({
      bankName: "",
      accountNumber: "1234567890",
      accountHolder: "Ahmad Fauzi",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty accountNumber", () => {
    const result = giftAccountSchema.safeParse({
      bankName: "BCA",
      accountNumber: "",
      accountHolder: "Ahmad Fauzi",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty accountHolder", () => {
    const result = giftAccountSchema.safeParse({
      bankName: "BCA",
      accountNumber: "1234567890",
      accountHolder: "",
    });
    expect(result.success).toBe(false);
  });
});

// === sanitizeInput ===

describe("sanitizeInput", () => {
  it("replaces & with &amp;", () => {
    expect(sanitizeInput("a & b")).toBe("a &amp; b");
  });

  it("replaces < with &lt;", () => {
    expect(sanitizeInput("<script>")).toBe("&lt;script&gt;");
  });

  it("replaces > with &gt;", () => {
    expect(sanitizeInput("a > b")).toBe("a &gt; b");
  });

  it('replaces " with &quot;', () => {
    expect(sanitizeInput('say "hello"')).toBe("say &quot;hello&quot;");
  });

  it("replaces ' with &#x27;", () => {
    expect(sanitizeInput("it's")).toBe("it&#x27;s");
  });

  it("sanitizes a full XSS attack string", () => {
    const input = '<script>alert("xss")</script>';
    const expected =
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;";
    expect(sanitizeInput(input)).toBe(expected);
  });

  it("leaves safe text unchanged", () => {
    expect(sanitizeInput("Hello World 123")).toBe("Hello World 123");
  });

  it("handles empty string", () => {
    expect(sanitizeInput("")).toBe("");
  });
});

// === validateFileType ===

describe("validateFileType", () => {
  it("accepts allowed image types", () => {
    expect(validateFileType("image/jpeg", ALLOWED_IMAGE_TYPES)).toBe(true);
    expect(validateFileType("image/png", ALLOWED_IMAGE_TYPES)).toBe(true);
    expect(validateFileType("image/webp", ALLOWED_IMAGE_TYPES)).toBe(true);
  });

  it("rejects disallowed image types", () => {
    expect(validateFileType("image/gif", ALLOWED_IMAGE_TYPES)).toBe(false);
    expect(validateFileType("image/bmp", ALLOWED_IMAGE_TYPES)).toBe(false);
    expect(validateFileType("application/pdf", ALLOWED_IMAGE_TYPES)).toBe(false);
  });

  it("accepts allowed music types", () => {
    expect(validateFileType("audio/mpeg", ALLOWED_MUSIC_TYPES)).toBe(true);
  });

  it("rejects disallowed music types", () => {
    expect(validateFileType("audio/wav", ALLOWED_MUSIC_TYPES)).toBe(false);
    expect(validateFileType("audio/ogg", ALLOWED_MUSIC_TYPES)).toBe(false);
  });
});

// === validateFileSize ===

describe("validateFileSize", () => {
  it("accepts file at exactly max size", () => {
    expect(validateFileSize(MAX_MUSIC_SIZE, MAX_MUSIC_SIZE)).toBe(true);
  });

  it("accepts file smaller than max size", () => {
    expect(validateFileSize(5 * 1024 * 1024, MAX_MUSIC_SIZE)).toBe(true);
  });

  it("rejects file larger than max size", () => {
    expect(validateFileSize(MAX_MUSIC_SIZE + 1, MAX_MUSIC_SIZE)).toBe(false);
  });

  it("accepts zero-size file", () => {
    expect(validateFileSize(0, MAX_MUSIC_SIZE)).toBe(true);
  });
});

// === Constants ===

describe("constants", () => {
  it("ALLOWED_IMAGE_TYPES contains jpeg, png, webp", () => {
    expect(ALLOWED_IMAGE_TYPES).toEqual(["image/jpeg", "image/png", "image/webp"]);
  });

  it("ALLOWED_MUSIC_TYPES contains audio/mpeg", () => {
    expect(ALLOWED_MUSIC_TYPES).toEqual(["audio/mpeg"]);
  });

  it("MAX_MUSIC_SIZE is 10MB", () => {
    expect(MAX_MUSIC_SIZE).toBe(10 * 1024 * 1024);
  });

  it("MAX_GALLERY_COUNT is 20", () => {
    expect(MAX_GALLERY_COUNT).toBe(20);
  });
});
