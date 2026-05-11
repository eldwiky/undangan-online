# Implementation Plan: Web Undangan Online

## Overview

Implementasi platform undangan online pernikahan menggunakan Next.js 14 App Router, Prisma ORM (PostgreSQL/NeonDB), Cloudinary untuk file storage, dan NextAuth.js untuk autentikasi. Fokus pada MVP dengan 1 template wedding yang lengkap dan polished.

## Tasks

- [x] 1. Setup project dan konfigurasi dasar
  - [x] 1.1 Inisialisasi Next.js 14 project dengan TypeScript dan Tailwind CSS
    - Jalankan `npx create-next-app@latest` dengan App Router, TypeScript, Tailwind CSS, ESLint
    - Install dependencies: `prisma`, `@prisma/client`, `next-auth`, `bcryptjs`, `zod`, `framer-motion`, `cloudinary`
    - Install dev dependencies: `@types/bcryptjs`, `vitest`, `@testing-library/react`
    - Buat file `.env.local` dengan variabel: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
    - _Requirements: 9.1, 9.3_

  - [x] 1.2 Setup Prisma schema dan database
    - Buat `prisma/schema.prisma` dengan model User, Invitation, Gallery, Comment, GiftAccount sesuai design document
    - Konfigurasi datasource PostgreSQL (NeonDB)
    - Jalankan `npx prisma generate` dan `npx prisma db push`
    - Buat `src/lib/prisma.ts` untuk singleton Prisma client
    - _Requirements: 10.2_

  - [x] 1.3 Buat types dan interfaces
    - Buat `src/types/index.ts` dengan TypeScript interfaces untuk semua model dan API responses
    - Definisikan `ApiErrorResponse`, `CountdownResult`, dan form types
    - _Requirements: 2.1, 3.1_

- [x] 2. Implementasi utility functions dan validasi
  - [x] 2.1 Implementasi slug generator
    - Buat `src/lib/slug.ts` dengan fungsi `generateSlug(groomName, brideName)` dan `ensureUniqueSlug(baseSlug, existingSlugs)`
    - Slug harus lowercase, spasi diganti dash, karakter spesial dihapus, format: nama-pria-nama-wanita
    - _Requirements: 2.2, 8.1_

  - [x]* 2.2 Write property test untuk slug generator
    - **Property 1: Slug Generation Determinism & Format**
    - **Validates: Requirements 2.2, 8.1**

  - [x] 2.3 Implementasi countdown calculator
    - Buat fungsi `calculateCountdown(eventDate, now)` di `src/lib/utils.ts`
    - Return days, hours, minutes, seconds, dan isPast flag
    - Jika tanggal sudah lewat, return isPast=true dengan semua nilai 0
    - _Requirements: 3.2, 3.3_

  - [x]* 2.4 Write property test untuk countdown calculator
    - **Property 5: Countdown Correctness**
    - **Validates: Requirements 3.2, 3.3**

  - [x] 2.5 Implementasi input validators dengan Zod
    - Buat `src/lib/validators.ts` dengan schema: registerSchema, invitationSchema, commentSchema, giftAccountSchema
    - Implementasi fungsi `sanitizeInput()` untuk XSS prevention
    - Implementasi `validateFileType()` dan `validateFileSize()`
    - _Requirements: 10.1, 4.3, 5.2, 5.3, 7.3_

  - [x]* 2.6 Write property tests untuk validators
    - **Property 6: File Type Validation**
    - **Property 7: File Size Validation**
    - **Property 9: Comment Validation**
    - **Property 12: XSS Sanitization**
    - **Validates: Requirements 4.3, 5.2, 5.3, 7.3, 10.1**

  - [x] 2.7 Implementasi rate limiter
    - Buat `src/lib/rate-limiter.ts` dengan fungsi `checkRateLimit(identifier, maxRequests, windowMs)`
    - Default: max 3 requests per 60 detik
    - _Requirements: 7.5_

  - [x]* 2.8 Write property test untuk rate limiter
    - **Property 10: Rate Limiting**
    - **Validates: Requirements 7.5**

- [x] 3. Checkpoint - Pastikan semua utility tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implementasi Authentication
  - [x] 4.1 Setup NextAuth.js dengan Credentials Provider
    - Buat `src/lib/auth.ts` dengan konfigurasi NextAuth (JWT strategy, Credentials Provider)
    - Buat `src/app/api/auth/[...nextauth]/route.ts`
    - Implementasi `authorize()` function dengan bcrypt password comparison
    - _Requirements: 1.2, 1.3_

  - [x] 4.2 Implementasi API register
    - Buat `src/app/api/auth/register/route.ts`
    - Validasi input dengan registerSchema
    - Hash password dengan bcrypt (salt rounds: 10)
    - Cek duplicate email sebelum create
    - _Requirements: 1.1, 1.5_

  - [x]* 4.3 Write property tests untuk authentication
    - **Property 2: Password Never Stored in Plaintext**
    - **Property 3: Invalid Credentials Return Generic Error**
    - **Property 4: Duplicate Email Rejection**
    - **Validates: Requirements 1.1, 1.3, 1.5**

  - [x] 4.4 Buat halaman Login dan Register
    - Buat `src/app/(auth)/login/page.tsx` dengan form email + password
    - Buat `src/app/(auth)/register/page.tsx` dengan form nama + email + password
    - Implementasi client-side validation dan error handling
    - Redirect ke dashboard setelah login berhasil
    - _Requirements: 1.2, 1.4_

  - [x] 4.5 Implementasi middleware auth protection
    - Buat `src/middleware.ts` untuk protect routes `/dashboard/*`
    - Redirect ke `/login` jika tidak ada session valid
    - _Requirements: 1.4, 10.3_

- [x] 5. Implementasi Dashboard dan CRUD Undangan
  - [x] 5.1 Implementasi API CRUD invitations
    - Buat `src/app/api/invitations/route.ts` (GET list, POST create)
    - Buat `src/app/api/invitations/[id]/route.ts` (GET detail, PUT update, DELETE)
    - Semua endpoint memverifikasi ownership (userId match)
    - Auto-generate slug saat create, ensure unique
    - Cascade delete: hapus Gallery, Comments, GiftAccounts saat delete invitation
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 10.3, 10.4_

  - [x]* 5.2 Write property tests untuk authorization dan cascade delete
    - **Property 11: Authorization Isolation**
    - **Property 13: Invitation Data Round-Trip**
    - **Property 14: Cascade Delete Completeness**
    - **Validates: Requirements 2.3, 2.4, 10.4**

  - [x] 5.3 Buat halaman Dashboard
    - Buat `src/app/(dashboard)/dashboard/page.tsx`
    - Tampilkan list undangan dengan judul, tanggal, slug
    - Tombol: Create New, Edit, Delete, Preview, Copy Link
    - Implementasi copy link ke clipboard
    - _Requirements: 2.1, 2.5, 2.6_

  - [x] 5.4 Buat halaman Edit Undangan
    - Buat `src/app/(dashboard)/dashboard/[id]/edit/page.tsx`
    - Form multi-section: Info Acara, Galeri, Musik, Rekening Hadiah
    - Tab navigation antar section
    - Auto-save atau save button per section
    - _Requirements: 2.3, 3.1_

- [x] 6. Implementasi File Upload (Cloudinary)
  - [x] 6.1 Setup Cloudinary integration
    - Buat `src/lib/cloudinary.ts` dengan fungsi upload dan delete
    - Konfigurasi upload presets untuk images dan audio
    - _Requirements: 4.1, 5.1_

  - [x] 6.2 Implementasi API upload gallery
    - Buat `src/app/api/invitations/[id]/gallery/route.ts`
    - Validasi: format file (JPG/PNG/WebP), max 20 foto per undangan
    - Upload ke Cloudinary, simpan URL ke database
    - Support delete foto individual
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 6.3 Implementasi API upload musik
    - Buat `src/app/api/invitations/[id]/music/route.ts`
    - Validasi: format MP3, max 10MB
    - Upload ke Cloudinary, simpan URL ke field musicUrl di Invitation
    - _Requirements: 5.1, 5.2, 5.3_

  - [x]* 6.4 Write property test untuk gallery count limit
    - **Property 8: Gallery Count Limit**
    - **Validates: Requirements 4.2**

- [x] 7. Implementasi Gift Accounts dan Comments API
  - [x] 7.1 Implementasi API gift accounts
    - Buat `src/app/api/invitations/[id]/gift-accounts/route.ts`
    - CRUD operations: list, create, delete
    - Validasi input dengan giftAccountSchema
    - Support upload QRIS image via Cloudinary
    - _Requirements: 6.1, 6.2, 6.4_

  - [x] 7.2 Implementasi API comments (public)
    - Buat `src/app/api/invitations/[id]/comments/route.ts`
    - GET: paginated (10 per page), sorted by newest
    - POST: validasi input, rate limiting (3 per menit per IP), sanitize XSS
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 10.1_

- [x] 8. Checkpoint - Pastikan semua API tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implementasi Halaman Undangan Publik
  - [x] 9.1 Buat halaman undangan dengan SSR
    - Buat `src/app/invitation/[slug]/page.tsx` dengan server-side data fetching
    - Fetch invitation data by slug, return 404 jika tidak ditemukan
    - Render template wedding dengan semua section
    - _Requirements: 8.2, 8.3, 9.1_

  - [x]* 9.2 Write property test untuk invalid slug handling
    - **Property 15: Invalid Slug Returns 404**
    - **Validates: Requirements 8.3**

  - [x] 9.3 Implementasi Opening Screen component
    - Buat `src/components/invitation/OpeningScreen.tsx`
    - Tampilkan nama mempelai dengan animasi Framer Motion
    - Tombol "Buka Undangan" untuk masuk ke konten utama
    - _Requirements: 8.2, 9.4_

  - [x] 9.4 Implementasi Event Info dan Countdown component
    - Buat `src/components/invitation/EventInfo.tsx` dan `Countdown.tsx`
    - Tampilkan nama mempelai, tanggal, waktu, deskripsi
    - Countdown timer real-time (update setiap detik)
    - Tampilkan "Acara telah berlangsung" jika tanggal lewat
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 9.5 Implementasi Location Map component
    - Buat `src/components/invitation/LocationMap.tsx`
    - Embed Google Maps iframe dari URL yang disimpan
    - Tombol "Buka Maps" yang membuka Google Maps di tab baru
    - Tampilkan nama lokasi dan alamat
    - _Requirements: 3.4_

  - [x] 9.6 Implementasi Gallery component
    - Buat `src/components/invitation/Gallery.tsx`
    - Carousel/slider responsive dengan Framer Motion
    - Lightbox preview saat foto diklik
    - Lazy loading untuk optimasi performa
    - _Requirements: 4.4, 4.5, 9.5_

  - [x] 9.7 Implementasi Music Player component
    - Buat `src/components/invitation/MusicPlayer.tsx`
    - Tombol play/pause floating
    - Loop musik otomatis
    - Indikator visual saat musik aktif (animasi icon)
    - _Requirements: 5.4, 5.5_

  - [x] 9.8 Implementasi Gift Accounts component
    - Buat `src/components/invitation/GiftAccounts.tsx`
    - Tampilkan daftar rekening dengan nama bank, nomor, pemilik
    - Tombol copy nomor rekening ke clipboard
    - Tampilkan gambar QRIS jika ada
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 9.9 Implementasi Comments component
    - Buat `src/components/invitation/Comments.tsx`
    - Form: nama, pesan, pilihan kehadiran
    - List comments dengan pagination/load more
    - Client-side validation sebelum submit
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 9.10 Implementasi Share Buttons component
    - Buat `src/components/invitation/ShareButtons.tsx`
    - Tombol: Copy Link, Share WhatsApp, Share Telegram
    - WhatsApp: buka `https://wa.me/?text={encoded_message}`
    - Telegram: buka `https://t.me/share/url?url={url}&text={text}`
    - _Requirements: 8.4, 8.5_

- [x] 10. Styling dan Animasi Template Wedding
  - [x] 10.1 Desain template wedding yang elegan
    - Terapkan color scheme wedding (gold, cream, soft pink)
    - Typography yang elegan (serif untuk heading, sans-serif untuk body)
    - Responsive layout: mobile-first design
    - Section dividers dan decorative elements
    - _Requirements: 9.1, 9.2_

  - [x] 10.2 Implementasi animasi Framer Motion
    - Scroll-triggered animations untuk setiap section
    - Fade-in, slide-up untuk konten
    - Smooth transitions antar section
    - _Requirements: 9.4_

- [x] 11. Final Checkpoint - Pastikan semua tests pass dan integrasi berjalan
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Setiap task mereferensikan requirements spesifik untuk traceability
- Checkpoints memastikan validasi incremental
- Property tests memvalidasi correctness properties universal
- Unit tests memvalidasi contoh spesifik dan edge cases
- Gunakan `vitest` sebagai test runner dengan `@testing-library/react` untuk component tests
