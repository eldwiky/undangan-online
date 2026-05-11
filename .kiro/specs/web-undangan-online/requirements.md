# Requirements Document

## Pendahuluan

Web Undangan Online adalah platform untuk membuat dan membagikan undangan digital pernikahan. User dapat mendaftar, membuat undangan dengan template wedding yang elegan, mengisi data acara, upload foto & musik, menambahkan rekening hadiah, dan membagikan link undangan ke tamu. Tamu dapat melihat undangan, mengirim ucapan, dan melihat informasi acara.

## Glossary

- **System**: Aplikasi Web Undangan Online (Next.js App Router)
- **User**: Pengguna yang membuat undangan (pembuat undangan)
- **Tamu**: Orang yang menerima dan membuka link undangan
- **Invitation**: Halaman undangan digital yang dibuat oleh User
- **Slug**: URL-friendly identifier untuk undangan, auto-generated dari nama mempelai (format: nama1-nama2)
- **Dashboard**: Halaman pengelolaan undangan milik User
- **Template**: Desain/layout halaman undangan (MVP: 1 template wedding)
- **Gallery**: Kumpulan foto yang ditampilkan di halaman undangan
- **Gift_Account**: Informasi rekening bank untuk hadiah digital
- **Comment**: Ucapan/pesan dari Tamu pada halaman undangan
- **Cloudinary**: Layanan penyimpanan file untuk foto dan musik
- **NeonDB**: PostgreSQL database serverless

## Requirements

### Requirement 1

**User Story:** Sebagai User, saya ingin mendaftar dan login ke platform, sehingga saya dapat mengelola undangan saya secara aman.

#### Acceptance Criteria

1. WHEN User mengisi form registrasi dengan nama, email, dan password, THE System SHALL membuat akun baru dan menyimpan data ke database dengan password ter-hash
2. WHEN User mengisi form login dengan email dan password yang valid, THE System SHALL mengautentikasi User dan mengembalikan JWT token via NextAuth.js
3. WHEN User mengisi form login dengan email atau password yang tidak valid, THE System SHALL menampilkan pesan error "Email atau password salah" tanpa mengungkap field mana yang salah
4. WHEN User mengakses halaman yang memerlukan autentikasi tanpa token valid, THE System SHALL mengarahkan User ke halaman login
5. WHEN User melakukan registrasi dengan email yang sudah terdaftar, THE System SHALL menampilkan pesan error "Email sudah terdaftar"

### Requirement 2

**User Story:** Sebagai User, saya ingin mengelola undangan melalui dashboard, sehingga saya dapat membuat, mengedit, dan menghapus undangan.

#### Acceptance Criteria

1. WHEN User membuka halaman dashboard, THE System SHALL menampilkan daftar semua undangan milik User dengan judul, tanggal acara, dan slug
2. WHEN User membuat undangan baru dengan mengisi nama mempelai pria dan wanita, THE System SHALL membuat Invitation baru dan auto-generate slug dari nama mempelai (format: nama-pria-nama-wanita, lowercase, spasi diganti dash)
3. WHEN User mengedit undangan, THE System SHALL menyimpan perubahan data dan menampilkan konfirmasi berhasil
4. WHEN User menghapus undangan, THE System SHALL menghapus Invitation beserta semua data terkait (Gallery, Comments, Gift_Accounts) dari database
5. WHEN User menekan tombol preview, THE System SHALL membuka halaman undangan di tab baru
6. WHEN User menekan tombol copy link, THE System SHALL menyalin URL undangan ke clipboard dan menampilkan notifikasi berhasil

### Requirement 3

**User Story:** Sebagai User, saya ingin mengisi informasi acara pada undangan, sehingga Tamu dapat mengetahui detail acara pernikahan.

#### Acceptance Criteria

1. WHEN User mengisi form informasi acara (nama mempelai, tanggal, waktu, lokasi, deskripsi), THE System SHALL menyimpan data dan menampilkan pada halaman undangan
2. WHEN Tamu membuka halaman undangan, THE System SHALL menampilkan countdown timer yang menghitung mundur ke tanggal acara
3. WHEN tanggal acara sudah lewat, THE System SHALL menampilkan teks "Acara telah berlangsung" menggantikan countdown timer
4. WHEN User mengisi link Google Maps dan nama lokasi, THE System SHALL menampilkan embed Google Maps dan tombol "Buka Maps" pada halaman undangan

### Requirement 4

**User Story:** Sebagai User, saya ingin mengupload foto ke galeri undangan, sehingga Tamu dapat melihat foto-foto pasangan/acara.

#### Acceptance Criteria

1. WHEN User mengupload foto dengan format JPG, PNG, atau WebP, THE System SHALL mengupload file ke Cloudinary dan menyimpan URL ke database
2. WHEN User mengupload foto melebihi 20 foto per undangan, THE System SHALL menolak upload dan menampilkan pesan "Maksimal 20 foto per undangan"
3. WHEN User mengupload file dengan format selain JPG/PNG/WebP, THE System SHALL menolak upload dan menampilkan pesan "Format file tidak didukung"
4. WHEN Tamu membuka halaman undangan, THE System SHALL menampilkan galeri foto dalam format carousel/slider yang responsive
5. WHEN Tamu mengklik foto di galeri, THE System SHALL menampilkan foto dalam lightbox preview

### Requirement 5

**User Story:** Sebagai User, saya ingin menambahkan musik background pada undangan, sehingga Tamu mendapat pengalaman yang lebih immersive.

#### Acceptance Criteria

1. WHEN User mengupload file MP3 dengan ukuran maksimal 10MB, THE System SHALL mengupload file ke Cloudinary dan menyimpan URL ke database
2. WHEN User mengupload file musik melebihi 10MB, THE System SHALL menolak upload dan menampilkan pesan "Ukuran file maksimal 10MB"
3. WHEN User mengupload file dengan format selain MP3, THE System SHALL menolak upload dan menampilkan pesan "Format file harus MP3"
4. WHEN Tamu membuka halaman undangan yang memiliki musik, THE System SHALL menampilkan tombol play/pause dan memutar musik secara loop
5. WHILE musik sedang diputar, THE System SHALL menampilkan indikator visual bahwa musik aktif

### Requirement 6

**User Story:** Sebagai User, saya ingin menambahkan rekening hadiah pada undangan, sehingga Tamu dapat mengirim hadiah digital.

#### Acceptance Criteria

1. WHEN User menambahkan rekening hadiah dengan nama bank, nomor rekening, dan nama pemilik, THE System SHALL menyimpan data ke database dan menampilkan pada halaman undangan
2. WHEN User menambahkan multiple rekening hadiah, THE System SHALL menampilkan semua rekening dalam daftar yang rapi
3. WHEN Tamu menekan tombol copy pada nomor rekening, THE System SHALL menyalin nomor rekening ke clipboard dan menampilkan notifikasi berhasil
4. WHEN User mengupload gambar QRIS, THE System SHALL mengupload ke Cloudinary dan menampilkan gambar QRIS pada halaman undangan

### Requirement 7

**User Story:** Sebagai Tamu, saya ingin mengirim ucapan pada undangan, sehingga saya dapat memberikan doa dan selamat kepada mempelai.

#### Acceptance Criteria

1. WHEN Tamu mengisi form ucapan dengan nama dan pesan, THE System SHALL menyimpan comment ke database dan menampilkan pada halaman undangan
2. WHEN Tamu memilih status kehadiran (Hadir/Tidak Hadir/Ragu-ragu), THE System SHALL menyimpan status kehadiran bersama comment
3. WHEN Tamu mengirim ucapan tanpa mengisi nama atau pesan, THE System SHALL menampilkan pesan validasi "Nama dan pesan wajib diisi"
4. WHEN halaman undangan memiliki lebih dari 10 comments, THE System SHALL menampilkan pagination atau tombol "Load More"
5. IF Tamu mengirim lebih dari 3 ucapan dalam 1 menit, THEN THE System SHALL menolak pengiriman dan menampilkan pesan "Terlalu banyak pesan, coba lagi nanti"

### Requirement 8

**User Story:** Sebagai User, saya ingin membagikan link undangan, sehingga Tamu dapat mengakses undangan dengan mudah.

#### Acceptance Criteria

1. THE System SHALL menghasilkan URL undangan dengan format /invitation/{slug} dimana slug auto-generated dari nama mempelai
2. WHEN Tamu membuka URL undangan yang valid, THE System SHALL menampilkan halaman undangan dengan opening screen
3. WHEN Tamu membuka URL undangan yang tidak valid, THE System SHALL menampilkan halaman 404 dengan pesan "Undangan tidak ditemukan"
4. WHEN User menekan tombol share WhatsApp, THE System SHALL membuka WhatsApp dengan pesan template berisi link undangan
5. WHEN User menekan tombol share Telegram, THE System SHALL membuka Telegram dengan pesan template berisi link undangan

### Requirement 9

**User Story:** Sebagai User, saya ingin undangan tampil dengan desain yang elegan dan responsive, sehingga Tamu mendapat pengalaman visual yang baik di semua perangkat.

#### Acceptance Criteria

1. THE System SHALL menampilkan halaman undangan menggunakan template wedding yang responsive di mobile, tablet, dan desktop
2. WHEN Tamu membuka undangan di perangkat mobile, THE System SHALL menampilkan layout yang optimal untuk layar kecil tanpa horizontal scroll
3. THE System SHALL memuat halaman undangan dalam waktu kurang dari 3 detik pada koneksi 4G
4. WHEN halaman undangan dimuat, THE System SHALL menerapkan animasi smooth menggunakan Framer Motion pada elemen-elemen utama
5. THE System SHALL mengoptimasi gambar menggunakan lazy loading dan format yang sesuai untuk performa optimal

### Requirement 10

**User Story:** Sebagai User, saya ingin data undangan saya aman, sehingga tidak ada pihak yang tidak berwenang yang dapat mengakses atau memodifikasi undangan saya.

#### Acceptance Criteria

1. THE System SHALL memvalidasi semua input dari User dan Tamu untuk mencegah XSS attack
2. THE System SHALL menggunakan parameterized queries melalui Prisma ORM untuk mencegah SQL injection
3. WHEN User mengakses API endpoint yang memerlukan autentikasi, THE System SHALL memverifikasi JWT token sebelum memproses request
4. WHEN User mencoba mengakses atau memodifikasi undangan milik User lain, THE System SHALL menolak request dengan status 403 Forbidden
