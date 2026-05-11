# Design Document

## Arsitektur

### Overview

Aplikasi Web Undangan Online menggunakan arsitektur monolitik berbasis Next.js 14 App Router dengan server-side rendering dan API routes. Semua fitur diimplementasikan dalam satu codebase Next.js yang di-deploy ke Vercel.

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **Database**: PostgreSQL (NeonDB) via Prisma ORM
- **Authentication**: NextAuth.js (JWT strategy)
- **File Storage**: Cloudinary (foto & musik)
- **Deployment**: Vercel

### Struktur Direktori

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       ├── page.tsx
│   │       └── [id]/
│   │           └── edit/page.tsx
│   ├── invitation/
│   │   └── [slug]/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── invitations/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       ├── gallery/route.ts
│   │   │       ├── music/route.ts
│   │   │       ├── gift-accounts/route.ts
│   │   │       └── comments/route.ts
│   │   └── upload/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── invitation/
│   │   ├── OpeningScreen.tsx
│   │   ├── EventInfo.tsx
│   │   ├── Countdown.tsx
│   │   ├── Gallery.tsx
│   │   ├── MusicPlayer.tsx
│   │   ├── GiftAccounts.tsx
│   │   ├── Comments.tsx
│   │   ├── LocationMap.tsx
│   │   └── ShareButtons.tsx
│   └── auth/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── cloudinary.ts
│   ├── validators.ts
│   ├── slug.ts
│   └── utils.ts
├── types/
│   └── index.ts
└── prisma/
    ├── schema.prisma
    └── migrations/
```

## Komponen

### 1. Authentication Module

**File**: `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`

NextAuth.js dikonfigurasi dengan Credentials Provider dan JWT strategy.

```typescript
// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !await bcrypt.compare(credentials.password, user.password)) {
          return null;
        }

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
};
```

### 2. Slug Generator

**File**: `src/lib/slug.ts`

Fungsi pure untuk generate slug dari nama mempelai.

```typescript
// src/lib/slug.ts
export function generateSlug(groomName: string, brideName: string): string {
  const normalize = (name: string): string =>
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const groomSlug = normalize(groomName);
  const brideSlug = normalize(brideName);

  return `${groomSlug}-${brideSlug}`;
}

export function ensureUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(baseSlug)) return baseSlug;

  let counter = 1;
  while (existingSlugs.includes(`${baseSlug}-${counter}`)) {
    counter++;
  }
  return `${baseSlug}-${counter}`;
}
```

### 3. Countdown Calculator

**File**: `src/lib/utils.ts`

```typescript
// src/lib/utils.ts
export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export function calculateCountdown(eventDate: Date, now: Date = new Date()): CountdownResult {
  const diff = eventDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isPast: false };
}
```

### 4. Input Validator

**File**: `src/lib/validators.ts`

```typescript
// src/lib/validators.ts
import { z } from "zod";

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

// XSS sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// File validation
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_MUSIC_TYPES = ["audio/mpeg"];
export const MAX_MUSIC_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_GALLERY_COUNT = 20;

export function validateFileType(mimeType: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(mimeType);
}

export function validateFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize;
}
```

### 5. Rate Limiter

**File**: `src/lib/rate-limiter.ts`

```typescript
// src/lib/rate-limiter.ts
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 3,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count };
}
```

## Data Model

### Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String       @id @default(uuid())
  name        String
  email       String       @unique
  password    String
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  invitations Invitation[]
}

model Invitation {
  id            String         @id @default(uuid())
  userId        String
  groomName     String
  brideName     String
  title         String
  slug          String         @unique
  eventDate     DateTime
  eventTime     String?
  location      String?
  locationName  String?
  mapsUrl       String?
  description   String?
  musicUrl      String?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  user          User           @relation(fields: [userId], references: [id])
  gallery       Gallery[]
  comments      Comment[]
  giftAccounts  GiftAccount[]

  @@index([userId])
  @@index([slug])
}

model Gallery {
  id           String     @id @default(uuid())
  invitationId String
  imageUrl     String
  order        Int        @default(0)
  createdAt    DateTime   @default(now())
  invitation   Invitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)

  @@index([invitationId])
}

model Comment {
  id           String     @id @default(uuid())
  invitationId String
  guestName    String
  message      String
  attendance   String     @default("hadir")
  createdAt    DateTime   @default(now())
  invitation   Invitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)

  @@index([invitationId])
}

model GiftAccount {
  id            String     @id @default(uuid())
  invitationId  String
  bankName      String
  accountNumber String
  accountHolder String
  qrisUrl       String?
  createdAt     DateTime   @default(now())
  invitation    Invitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)

  @@index([invitationId])
}
```

## API Interfaces

### Authentication

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registrasi user baru |
| POST | `/api/auth/[...nextauth]` | Login via NextAuth.js |

### Invitations

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/invitations` | List undangan milik user |
| POST | `/api/invitations` | Buat undangan baru |
| GET | `/api/invitations/[id]` | Detail undangan |
| PUT | `/api/invitations/[id]` | Update undangan |
| DELETE | `/api/invitations/[id]` | Hapus undangan + cascade |

### Gallery

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/invitations/[id]/gallery` | List foto galeri |
| POST | `/api/invitations/[id]/gallery` | Upload foto |
| DELETE | `/api/invitations/[id]/gallery/[photoId]` | Hapus foto |

### Music

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/invitations/[id]/music` | Upload musik |
| DELETE | `/api/invitations/[id]/music` | Hapus musik |

### Gift Accounts

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/invitations/[id]/gift-accounts` | List rekening |
| POST | `/api/invitations/[id]/gift-accounts` | Tambah rekening |
| DELETE | `/api/invitations/[id]/gift-accounts/[accountId]` | Hapus rekening |

### Comments (Public)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/invitations/[id]/comments` | List comments (paginated) |
| POST | `/api/invitations/[id]/comments` | Kirim ucapan (rate limited) |

### Public Invitation

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/invitation/[slug]` | Halaman undangan publik (SSR) |

## Error Handling

### Strategy

Semua API endpoint menggunakan consistent error response format:

```typescript
interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}
```

### Error Cases

| Kode | Kondisi | Response |
|------|---------|----------|
| 400 | Validasi input gagal | Detail field yang error |
| 401 | Token tidak valid/expired | Redirect ke login |
| 403 | Akses undangan milik user lain | "Akses ditolak" |
| 404 | Undangan/resource tidak ditemukan | "Tidak ditemukan" |
| 413 | File terlalu besar | "Ukuran file melebihi batas" |
| 415 | Format file tidak didukung | "Format file tidak didukung" |
| 429 | Rate limit exceeded | "Terlalu banyak request" |
| 500 | Server error | "Terjadi kesalahan server" |

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Slug Generation Determinism & Format

*For any* pair of valid groom name and bride name strings, the generated slug SHALL always be lowercase, contain only alphanumeric characters and dashes, and follow the format `{normalized-groom}-{normalized-bride}`.

**Validates: Requirements 2.2, 8.1**

### Property 2: Password Never Stored in Plaintext

*For any* valid registration request with a password, the stored password in the database SHALL NOT equal the original plaintext password, and SHALL be verifiable via bcrypt compare.

**Validates: Requirements 1.1**

### Property 3: Invalid Credentials Return Generic Error

*For any* login attempt with invalid email or invalid password, the System SHALL return the same generic error message without revealing which field is incorrect.

**Validates: Requirements 1.3**

### Property 4: Duplicate Email Rejection

*For any* email that already exists in the database, a registration attempt with that same email SHALL be rejected with an appropriate error.

**Validates: Requirements 1.5**

### Property 5: Countdown Correctness

*For any* event date in the future and any current time before that date, the calculated countdown SHALL produce non-negative values for days, hours, minutes, and seconds that sum to the correct time difference. *For any* event date in the past, the countdown SHALL return isPast=true with all values at zero.

**Validates: Requirements 3.2, 3.3**

### Property 6: File Type Validation

*For any* file with a MIME type not in the allowed list (JPG/PNG/WebP for images, MP3 for music), the upload validation SHALL reject the file. *For any* file with an allowed MIME type, the validation SHALL accept it.

**Validates: Requirements 4.3, 5.3**

### Property 7: File Size Validation

*For any* music file with size exceeding 10MB, the upload validation SHALL reject the file. *For any* music file with size at or below 10MB, the size validation SHALL pass.

**Validates: Requirements 5.2**

### Property 8: Gallery Count Limit

*For any* invitation that already has 20 photos in the gallery, an additional upload attempt SHALL be rejected.

**Validates: Requirements 4.2**

### Property 9: Comment Validation

*For any* comment submission where guest name is empty or message is empty, the System SHALL reject the submission with a validation error. *For any* comment with both non-empty name and non-empty message, the validation SHALL pass.

**Validates: Requirements 7.3**

### Property 10: Rate Limiting

*For any* identifier that has made N requests within the time window (where N >= max allowed), the next request SHALL be rejected. *For any* identifier with fewer than max requests in the window, the request SHALL be allowed.

**Validates: Requirements 7.5**

### Property 11: Authorization Isolation

*For any* authenticated user attempting to access or modify an invitation belonging to a different user, the System SHALL return a 403 Forbidden response.

**Validates: Requirements 10.4**

### Property 12: XSS Sanitization

*For any* input string containing HTML/script tags or special characters, the sanitized output SHALL not contain executable HTML or JavaScript, while preserving the semantic content of the original text.

**Validates: Requirements 10.1**

### Property 13: Invitation Data Round-Trip

*For any* valid invitation data (groom name, bride name, event date, location, description), saving to the database and then retrieving by ID SHALL return data equivalent to the original input.

**Validates: Requirements 2.3, 3.1**

### Property 14: Cascade Delete Completeness

*For any* invitation with associated gallery items, comments, and gift accounts, deleting the invitation SHALL result in zero related records remaining in the database for that invitation ID.

**Validates: Requirements 2.4**

### Property 15: Invalid Slug Returns 404

*For any* slug string that does not exist in the database, accessing `/invitation/{slug}` SHALL return a 404 response.

**Validates: Requirements 8.3**
