export type Language = "id" | "en";

export interface Translations {
  // Hero section
  kamiYangBerbahagia: string;
  
  // Opening
  saveTheDate: string;
  openInvitation: string;
  kepada: string;
  
  // Sections
  ayatSuci: string;
  mempelai: string;
  menghitungHari: string;
  acaraPernikahan: string;
  akadNikah: string;
  resepsi: string;
  galeri: string;
  ceritaCinta: string;
  ucapanDoa: string;
  hadiah: string;
  terimaKasih: string;
  
  // Countdown
  hari: string;
  jam: string;
  menit: string;
  detik: string;
  acaraTelahBerlangsung: string;
  
  // Events
  bukaMaps: string;
  saveTheDateBtn: string;
  
  // Comments
  nama: string;
  ucapan: string;
  kehadiran: string;
  hadir: string;
  tidakHadir: string;
  kirimUcapan: string;
  mengirim: string;
  ucapanBerhasil: string;
  namaWajib: string;
  pesanWajib: string;
  belumAdaUcapan: string;
  
  // Gift
  pesanHadiah: string;
  kirimHadiah: string;
  sembunyikan: string;
  salin: string;
  tersalin: string;
  
  // Footer
  madeWith: string;
  
  // Days & Months (for date formatting)
  days: string[];
  months: string[];
}

const id: Translations = {
  kamiYangBerbahagia: "Kami Yang Berbahagia",
  saveTheDate: "Save the Date",
  openInvitation: "Open Invitation",
  kepada: "Kepada,",
  ayatSuci: "Ayat Suci",
  mempelai: "Mempelai",
  menghitungHari: "Menghitung Hari",
  acaraPernikahan: "Acara Pernikahan",
  akadNikah: "Akad Nikah",
  resepsi: "Resepsi",
  galeri: "Galeri",
  ceritaCinta: "Cerita Cinta",
  ucapanDoa: "Ucapan & Doa",
  hadiah: "Hadiah",
  terimaKasih: "Terima Kasih",
  hari: "Hari",
  jam: "Jam",
  menit: "Menit",
  detik: "Detik",
  acaraTelahBerlangsung: "Acara telah berlangsung",
  bukaMaps: "Buka Maps",
  saveTheDateBtn: "Save the Date",
  nama: "Nama",
  ucapan: "Ucapan",
  kehadiran: "Kehadiran",
  hadir: "Hadir",
  tidakHadir: "Tidak Hadir",
  kirimUcapan: "Kirim Ucapan",
  mengirim: "Mengirim...",
  ucapanBerhasil: "Ucapan berhasil dikirim!",
  namaWajib: "Nama wajib diisi",
  pesanWajib: "Pesan wajib diisi",
  belumAdaUcapan: "Belum ada ucapan. Jadilah yang pertama!",
  pesanHadiah: "Berbagi kebahagiaan bersama Anda merupakan hadiah terindah bagi kami.",
  kirimHadiah: "Kirim Hadiah",
  sembunyikan: "Sembunyikan",
  salin: "Salin",
  tersalin: "Tersalin!",
  madeWith: "Made with ♥",
  days: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
  months: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
};

const en: Translations = {
  kamiYangBerbahagia: "The Happy Couple",
  saveTheDate: "Save the Date",
  openInvitation: "Open Invitation",
  kepada: "Dear,",
  ayatSuci: "Holy Verse",
  mempelai: "The Couple",
  menghitungHari: "Counting Days",
  acaraPernikahan: "Wedding Events",
  akadNikah: "Holy Matrimony",
  resepsi: "Reception",
  galeri: "Gallery",
  ceritaCinta: "Our Love Story",
  ucapanDoa: "Wishes & Prayers",
  hadiah: "Gift",
  terimaKasih: "Thank You",
  hari: "Days",
  jam: "Hours",
  menit: "Minutes",
  detik: "Seconds",
  acaraTelahBerlangsung: "The event has passed",
  bukaMaps: "Open Maps",
  saveTheDateBtn: "Save the Date",
  nama: "Name",
  ucapan: "Message",
  kehadiran: "Attendance",
  hadir: "Attending",
  tidakHadir: "Not Attending",
  kirimUcapan: "Send Wishes",
  mengirim: "Sending...",
  ucapanBerhasil: "Your wishes have been sent!",
  namaWajib: "Name is required",
  pesanWajib: "Message is required",
  belumAdaUcapan: "No wishes yet. Be the first!",
  pesanHadiah: "Sharing this happiness with you is the greatest gift for us.",
  kirimHadiah: "Send Gift",
  sembunyikan: "Hide",
  salin: "Copy",
  tersalin: "Copied!",
  madeWith: "Made with ♥",
  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

const translations: Record<Language, Translations> = { id, en };

export function getTranslations(lang: string): Translations {
  return translations[lang as Language] || translations.id;
}

export function formatDate(dateStr: string, lang: string): string {
  const t = getTranslations(lang);
  const date = new Date(dateStr);
  const dayName = t.days[date.getDay()];
  const day = date.getDate();
  const month = t.months[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${day} ${month} ${year}`;
}
