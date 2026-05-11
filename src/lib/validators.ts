import { z } from "zod";

// === Zod Schemas ===

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const invitationSchema = z.object({
  groomName: z.string().min(2, "Nama mempelai pria wajib diisi"),
  brideName: z.string().min(2, "Nama mempelai wanita wajib diisi"),
  eventDate: z.string().datetime(),
  eventTime: z.string().optional(),
  location: z.string().optional(),
  locationName: z.string().optional(),
  mapsUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
});

export const commentSchema = z.object({
  guestName: z.string().min(1, "Nama wajib diisi").max(100),
  message: z.string().min(1, "Pesan wajib diisi").max(500),
  attendance: z.enum(["hadir", "tidak_hadir", "ragu"]),
});

export const giftAccountSchema = z.object({
  bankName: z.string().min(1, "Nama bank wajib diisi"),
  accountNumber: z.string().min(1, "Nomor rekening wajib diisi"),
  accountHolder: z.string().min(1, "Nama pemilik wajib diisi"),
});

// === XSS Sanitization ===

export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// === File Validation Constants ===

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_MUSIC_TYPES = ["audio/mpeg"];
export const MAX_MUSIC_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_GALLERY_COUNT = 20;

// === File Validation Functions ===

export function validateFileType(
  mimeType: string,
  allowedTypes: string[]
): boolean {
  return allowedTypes.includes(mimeType);
}

export function validateFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize;
}
