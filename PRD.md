# Product Requirements Document (PRD)

## Aplikasi Web Undangan Online

### 1. Overview

Aplikasi web undangan online adalah platform untuk membuat dan membagikan undangan digital acara seperti pernikahan, lamaran, ulang tahun, dan acara lainnya. User dapat membuat halaman undangan dengan desain modern yang dapat dibuka melalui link.

Fitur utama meliputi:

* Musik background
* Informasi acara & alamat
* Galeri foto
* Rekening hadiah digital
* Komentar / ucapan tamu

---

# 2. Tujuan Produk

### Tujuan Utama

Menyediakan platform undangan online yang:

* Mudah digunakan tanpa coding
* Mobile friendly
* Cepat dibagikan
* Tampilan elegan & modern
* Mendukung interaksi tamu

### Target User

* Pasangan yang akan menikah / lamaran
* Event organizer
* Pengguna umum yang ingin membuat undangan digital

---

# 3. User Flow

## Flow User Pembuat Undangan

1. Register / Login
2. Pilih template undangan
3. Isi data acara
4. Upload foto
5. Tambahkan musik
6. Tambahkan rekening hadiah
7. Publish undangan
8. Bagikan link undangan

## Flow Tamu Undangan

1. Membuka link undangan
2. Melihat opening screen
3. Masuk ke halaman utama
4. Mendengar musik otomatis/manual
5. Melihat detail acara
6. Melihat lokasi via maps
7. Melihat galeri foto
8. Mengirim ucapan/comment
9. Mengirim hadiah via rekening

---

# 4. Fitur Utama

## 4.1 Authentication

### Deskripsi

User dapat membuat akun dan login.

### Fitur

* Register
* Login
* Forgot password
* Login Google (optional)

---

# 4.2 Dashboard

### Deskripsi

Halaman untuk mengelola undangan.

### Fitur

* List undangan
* Create new invitation
* Edit invitation
* Delete invitation
* Preview invitation
* Copy share link

---

# 4.3 Template Undangan

### Deskripsi

Pilihan tema/design undangan.

### Fitur

* Template modern
* Template elegan
* Template islami
* Dark/light theme
* Responsive mobile

---

# 4.4 Informasi Acara

### Deskripsi

Menampilkan detail acara.

### Data

* Nama mempelai / acara
* Tanggal acara
* Waktu
* Lokasi
* Deskripsi acara
* Countdown timer

---

# 4.5 Alamat & Maps

### Deskripsi

Menampilkan lokasi acara.

### Fitur

* Embed Google Maps
* Tombol buka maps
* Copy address

### Data

* Nama lokasi
* Alamat lengkap
* Link maps

---

# 4.6 Music Background

### Deskripsi

Musik diputar pada halaman undangan.

### Fitur

* Upload MP3
* Autoplay
* Play/Pause button
* Loop music

### Rules

* Max file size: 10MB
* Format: MP3

---

# 4.7 Galeri Foto

### Deskripsi

Menampilkan foto pasangan/acara.

### Fitur

* Upload multiple images
* Slider/carousel
* Lightbox preview
* Responsive image

### Rules

* Max 20 foto
* Format JPG/PNG/WebP

---

# 4.8 Rekening Hadiah

### Deskripsi

Menampilkan rekening digital untuk gift.

### Fitur

* Multiple rekening
* Copy nomor rekening
* QRIS image upload

### Data

* Nama bank
* Nomor rekening
* Nama pemilik
* QRIS (optional)

---

# 4.9 Komentar / Ucapan

### Deskripsi

Tamu dapat mengirim ucapan.

### Fitur

* Nama pengirim
* Pesan ucapan
* Kehadiran (Hadir/Tidak)
* Pagination/load more
* Admin moderation

### Anti Spam

* Rate limiting
* Captcha

---

# 4.10 Share Undangan

### Deskripsi

Membagikan link undangan.

### Fitur

* Copy link
* Share WhatsApp
* Share Instagram
* Share Telegram

### URL Format

```txt
https://domain.com/invitation/dwiky-heydi
```

---

# 5. Admin Panel

## Fitur Admin

* Manage users
* Manage templates
* Moderasi komentar
* Statistik visitor
* Manage subscription

---

# 6. Non Functional Requirements

## Performance

* Load < 3 detik
* Optimized image
* Lazy loading

## Security

* HTTPS
* JWT Authentication
* Input validation
* XSS protection

## Compatibility

* Mobile responsive
* Chrome
* Safari
* Firefox
* Edge

---

# 7. Teknologi yang Direkomendasikan

## Frontend

* React / Next.js
* Tailwind CSS
* Framer Motion

## Backend

* Node.js
* Express / NestJS

## Database

* PostgreSQL / MySQL

## Storage

* Cloudinary / AWS S3

## Deployment

* Vercel
* Railway / AWS

---

# 8. Struktur Database Sederhana

## Users

| Field    | Type    |
| -------- | ------- |
| id       | UUID    |
| name     | VARCHAR |
| email    | VARCHAR |
| password | VARCHAR |

---

## Invitations

| Field      | Type     |
| ---------- | -------- |
| id         | UUID     |
| user_id    | UUID     |
| title      | VARCHAR  |
| slug       | VARCHAR  |
| event_date | DATETIME |
| location   | TEXT     |
| music_url  | TEXT     |

---

## Gallery

| Field         | Type |
| ------------- | ---- |
| id            | UUID |
| invitation_id | UUID |
| image_url     | TEXT |

---

## Comments

| Field         | Type    |
| ------------- | ------- |
| id            | UUID    |
| invitation_id | UUID    |
| guest_name    | VARCHAR |
| message       | TEXT    |
| attendance    | ENUM    |

---

## Gift Accounts

| Field          | Type    |
| -------------- | ------- |
| id             | UUID    |
| invitation_id  | UUID    |
| bank_name      | VARCHAR |
| account_number | VARCHAR |
| account_holder | VARCHAR |

---

# 9. MVP Scope

## Included

* Login/Register
* Create invitation
* Upload foto
* Music background
* Maps
* Rekening hadiah
* Komentar tamu
* Share link

## Excluded (Future)

* Tema premium
* RSVP QR Code
* Live streaming
* Custom domain
* Analytics detail

---

# 10. Future Enhancement

* RSVP otomatis
* Buku tamu digital
* Integrasi WhatsApp reminder
* Multi bahasa
* AI template generator
* Video background
* Guest management

---

# 11. Success Metrics

| Metric             | Target   |
| ------------------ | -------- |
| Waktu load         | <3 detik |
| Conversion publish | >70%     |
| Mobile usability   | >90      |
| Bounce rate        | <40%     |

---

# 12. Kesimpulan

Aplikasi undangan online ini berfokus pada:

* Kemudahan penggunaan
* Tampilan elegan
* Pengalaman mobile yang smooth
* Interaksi tamu secara digital

Fitur inti seperti musik, galeri foto, maps, rekening hadiah, dan komentar menjadi nilai utama untuk memberikan pengalaman undangan modern.
