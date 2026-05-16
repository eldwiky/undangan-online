"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import OpeningScreen from "@/components/invitation/OpeningScreen";
import GiftAccounts from "@/components/invitation/GiftAccounts";
import Comments from "@/components/invitation/Comments";
import MusicPlayer from "@/components/invitation/MusicPlayer";
import SpotifyTemplate from "@/components/templates/SpotifyTemplate";
import FloralTemplate from "@/components/templates/FloralTemplate";
import DoodleTemplate from "@/components/templates/DoodleTemplate";

// Serialized types
export interface SerializedGallery {
  id: string;
  invitationId: string;
  imageUrl: string;
  order: number;
  createdAt: string;
}

export interface SerializedComment {
  id: string;
  invitationId: string;
  guestName: string;
  message: string;
  attendance: string;
  createdAt: string;
}

export interface SerializedGiftAccount {
  id: string;
  invitationId: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrisUrl: string | null;
  createdAt: string;
}

export interface SerializedLoveStory {
  id: string;
  invitationId: string;
  title: string;
  date: string | null;
  description: string;
  order: number;
  createdAt: string;
}

export interface SerializedInvitation {
  id: string;
  userId: string;
  slug: string;
  title: string;
  groomName: string;
  groomFullName: string | null;
  groomPhoto: string | null;
  groomFather: string | null;
  groomMother: string | null;
  groomChildOrder: string | null;
  brideName: string;
  brideFullName: string | null;
  bridePhoto: string | null;
  brideFather: string | null;
  brideMother: string | null;
  brideChildOrder: string | null;
  quoteText: string | null;
  quoteSource: string | null;
  quoteArabic: string | null;
  quoteLatin: string | null;
  akadDate: string | null;
  akadTime: string | null;
  akadTimeEnd: string | null;
  akadLocation: string | null;
  akadLocationName: string | null;
  akadMapsUrl: string | null;
  resepsiDate: string | null;
  resepsiTime: string | null;
  resepsiTimeEnd: string | null;
  resepsiLocation: string | null;
  resepsiLocationName: string | null;
  resepsiMapsUrl: string | null;
  eventDate: string;
  eventTime: string | null;
  location: string | null;
  locationName: string | null;
  mapsUrl: string | null;
  description: string | null;
  musicUrl: string | null;
  hashtag: string | null;
  template: string;
  createdAt: string;
  updatedAt: string;
  gallery: SerializedGallery[];
  comments: SerializedComment[];
  giftAccounts: SerializedGiftAccount[];
  loveStories: SerializedLoveStory[];
}

interface InvitationClientProps {
  invitation: SerializedInvitation;
}

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

// Section Divider
function Divider() {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      whileInView={{ opacity: 1, scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="flex items-center justify-center py-8"
    >
      <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400/60" />
      <span className="mx-4 text-amber-500 text-lg">✦</span>
      <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400/60" />
    </motion.div>
  );
}

// Smart Save the Date - Google Calendar for Android, ICS for iOS/Desktop
function saveTheDate(invitation: SerializedInvitation) {
  const title = `Pernikahan ${invitation.groomName} & ${invitation.brideName}`;
  const eventDate = invitation.resepsiDate || invitation.akadDate || invitation.eventDate;
  const date = new Date(eventDate);
  
  const startTime = invitation.resepsiTime || invitation.akadTime || "08:00";
  const endTime = invitation.resepsiTimeEnd || invitation.akadTimeEnd || "12:00";
  
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  
  const startDate = new Date(date);
  startDate.setHours(startH, startM, 0, 0);
  
  const endDateObj = new Date(date);
  endDateObj.setHours(endH, endM, 0, 0);
  
  const location = invitation.resepsiLocationName || invitation.akadLocationName || invitation.locationName || "";
  const description = `Undangan pernikahan ${invitation.groomName} & ${invitation.brideName}`;

  // Detect if Android
  const isAndroid = /android/i.test(navigator.userAgent);
  
  if (isAndroid) {
    // Android: Use Google Calendar intent (opens app directly)
    const formatGCal = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatGCal(startDate)}/${formatGCal(endDateObj)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
    window.open(gcalUrl, "_blank");
  } else {
    // iOS & Desktop: Download .ics file (iOS opens Calendar app directly)
    const formatICS = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Web Undangan//ID",
      "BEGIN:VEVENT",
      `DTSTART:${formatICS(startDate)}`,
      `DTEND:${formatICS(endDateObj)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invitation.groomName}-${invitation.brideName}-wedding.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Countdown component inline
function CountdownSection({ eventDate }: { eventDate: string }) {
  const [countdown, setCountdown] = useState(calcCountdown(new Date(eventDate)));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(calcCountdown(new Date(eventDate)));
    }, 1000);
    return () => clearInterval(interval);
  }, [eventDate]);

  if (countdown.isPast) {
    return (
      <motion.p
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="text-gray-500 italic text-center"
      >
        Acara telah berlangsung
      </motion.p>
    );
  }

  const units = [
    { value: countdown.days, label: "Hari" },
    { value: countdown.hours, label: "Jam" },
    { value: countdown.minutes, label: "Menit" },
    { value: countdown.seconds, label: "Detik" },
  ];

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="flex justify-center gap-3 sm:gap-5"
    >
      {units.map((unit) => (
        <motion.div
          key={unit.label}
          variants={fadeUp}
          className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-5 shadow-sm border border-amber-100 min-w-[70px]"
        >
          <div className="text-2xl sm:text-3xl font-bold text-amber-700 font-serif">
            {unit.value}
          </div>
          <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mt-1">
            {unit.label}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// Gallery with lightbox
function GallerySection({ photos }: { photos: SerializedGallery[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  if (photos.length === 0) return null;

  return (
    <>
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-2 md:grid-cols-3 gap-3"
      >
        {photos.map((photo, i) => (
          <motion.div
            key={photo.id}
            variants={fadeUp}
            className="aspect-square rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow"
            onClick={() => setSelected(photo.imageUrl)}
          >
            <img
              src={photo.imageUrl}
              alt={`Foto ${i + 1}`}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelected(null)}
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={selected}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white text-xl hover:bg-white/30"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function InvitationClient({ invitation }: InvitationClientProps) {
  const [isOpened, setIsOpened] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const searchParams = useSearchParams();
  const guestName = searchParams.get("to");

  // Template routing: render Spotify template if selected
  if (invitation.template === "spotify") {
    return <SpotifyTemplate invitation={invitation} guestName={guestName} />;
  }

  // Template routing: render Floral template if selected
  if (invitation.template === "floral") {
    return <FloralTemplate invitation={invitation} guestName={guestName} />;
  }

  // Template routing: render Doodle template if selected
  if (invitation.template === "doodle") {
    return <DoodleTemplate invitation={invitation} guestName={guestName} />;
  }

  if (!isOpened) {
    return (
      <OpeningScreen
        groomName={invitation.groomName}
        brideName={invitation.brideName}
        eventDate={invitation.eventDate}
        hashtag={invitation.hashtag}
        guestName={guestName}
        onOpen={() => setIsOpened(true)}
      />
    );
  }

  return (
    <main ref={mainRef} className="min-h-screen bg-gradient-to-b from-[#fdf8f0] via-white to-[#fdf8f0] overflow-hidden">

      {/* ═══════════ 1. AYAT / QUOTE ═══════════ */}
      {(invitation.quoteText || invitation.quoteArabic) && (
        <section className="py-20 px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-xl mx-auto text-center"
          >
            <span className="text-amber-400 text-3xl block mb-6">❝</span>
            {invitation.quoteArabic && (
              <p dir="rtl" className="text-2xl md:text-3xl text-gray-800 leading-loose mb-6 font-serif">
                {invitation.quoteArabic}
              </p>
            )}
            {invitation.quoteText && (
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-serif">
                {invitation.quoteText}
              </p>
            )}
            {invitation.quoteSource && (
              <p className="mt-6 text-sm text-amber-700 font-medium tracking-wide">
                — {invitation.quoteSource}
              </p>
            )}
          </motion.div>
        </section>
      )}

      <Divider />

      {/* ═══════════ 2. PROFIL MEMPELAI ═══════════ */}
      <section className="py-16 px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <motion.h2
            variants={fadeUp}
            className="text-3xl font-serif text-center text-gray-800 mb-14"
          >
            Mempelai
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Pria */}
            <motion.div variants={fadeUp} className="text-center">
              {invitation.groomPhoto ? (
                <div className="w-44 h-44 mx-auto mb-5 rounded-full overflow-hidden border-4 border-amber-200 shadow-lg">
                  <img src={invitation.groomPhoto} alt={invitation.groomName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-44 h-44 mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shadow-lg">
                  <span className="text-4xl text-amber-600">♂</span>
                </div>
              )}
              <h3 className="text-2xl font-serif text-gray-800">
                {invitation.groomFullName || invitation.groomName}
              </h3>
              {invitation.groomChildOrder && (
                <p className="text-sm text-gray-500 mt-2 italic">{invitation.groomChildOrder}</p>
              )}
              {(invitation.groomFather || invitation.groomMother) && (
                <p className="text-sm text-gray-600 mt-1">
                  {invitation.groomFather && `Bapak ${invitation.groomFather}`}
                  {invitation.groomFather && invitation.groomMother && " & "}
                  {invitation.groomMother && `Ibu ${invitation.groomMother}`}
                </p>
              )}
            </motion.div>

            {/* Wanita */}
            <motion.div variants={fadeUp} className="text-center">
              {invitation.bridePhoto ? (
                <div className="w-44 h-44 mx-auto mb-5 rounded-full overflow-hidden border-4 border-rose-200 shadow-lg">
                  <img src={invitation.bridePhoto} alt={invitation.brideName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-44 h-44 mx-auto mb-5 rounded-full bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center shadow-lg">
                  <span className="text-4xl text-rose-500">♀</span>
                </div>
              )}
              <h3 className="text-2xl font-serif text-gray-800">
                {invitation.brideFullName || invitation.brideName}
              </h3>
              {invitation.brideChildOrder && (
                <p className="text-sm text-gray-500 mt-2 italic">{invitation.brideChildOrder}</p>
              )}
              {(invitation.brideFather || invitation.brideMother) && (
                <p className="text-sm text-gray-600 mt-1">
                  {invitation.brideFather && `Bapak ${invitation.brideFather}`}
                  {invitation.brideFather && invitation.brideMother && " & "}
                  {invitation.brideMother && `Ibu ${invitation.brideMother}`}
                </p>
              )}
            </motion.div>
          </div>
        </motion.div>
      </section>

      <Divider />

      {/* ═══════════ 3. COUNTDOWN ═══════════ */}
      <section className="py-16 px-6 bg-gradient-to-b from-amber-50/50 to-transparent">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <motion.h2 variants={fadeUp} className="text-3xl font-serif text-gray-800 mb-10">
            Menghitung Hari
          </motion.h2>
          <CountdownSection eventDate={invitation.eventDate} />
        </motion.div>
      </section>

      <Divider />

      {/* ═══════════ 4. DETAIL ACARA ═══════════ */}
      <section className="py-16 px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <motion.h2 variants={fadeUp} className="text-3xl font-serif text-center text-gray-800 mb-12">
            Acara Pernikahan
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(invitation.akadDate || invitation.akadTime) && (
              <motion.div variants={fadeUp} className="text-center p-8 bg-white rounded-2xl shadow-md border border-amber-100/50">
                <div className="w-12 h-12 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-700 text-lg">💍</span>
                </div>
                <h3 className="text-xl font-serif text-gray-800 mb-4">Akad Nikah</h3>
                {invitation.akadDate && (
                  <p className="text-gray-600 font-medium">
                    {new Date(invitation.akadDate).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </p>
                )}
                {invitation.akadTime && <p className="text-gray-500 mt-1">{invitation.akadTime}{invitation.akadTimeEnd ? ` - ${invitation.akadTimeEnd}` : ""} WIB</p>}
                {invitation.akadLocationName && <p className="text-gray-700 font-medium mt-4">{invitation.akadLocationName}</p>}
                {invitation.akadLocation && <p className="text-sm text-gray-500 mt-1">{invitation.akadLocation}</p>}
                {invitation.akadMapsUrl && (
                  <a href={invitation.akadMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 px-5 py-2 text-sm bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors shadow-sm">
                    📍 Buka Maps
                  </a>
                )}
              </motion.div>
            )}

            {(invitation.resepsiDate || invitation.resepsiTime) && (
              <motion.div variants={fadeUp} className="text-center p-8 bg-white rounded-2xl shadow-md border border-rose-100/50">
                <div className="w-12 h-12 mx-auto mb-4 bg-rose-100 rounded-full flex items-center justify-center">
                  <span className="text-rose-600 text-lg">🎉</span>
                </div>
                <h3 className="text-xl font-serif text-gray-800 mb-4">Resepsi</h3>
                {invitation.resepsiDate && (
                  <p className="text-gray-600 font-medium">
                    {new Date(invitation.resepsiDate).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </p>
                )}
                {invitation.resepsiTime && <p className="text-gray-500 mt-1">{invitation.resepsiTime}{invitation.resepsiTimeEnd ? ` - ${invitation.resepsiTimeEnd}` : ""} WIB</p>}
                {invitation.resepsiLocationName && <p className="text-gray-700 font-medium mt-4">{invitation.resepsiLocationName}</p>}
                {invitation.resepsiLocation && <p className="text-sm text-gray-500 mt-1">{invitation.resepsiLocation}</p>}
                {invitation.resepsiMapsUrl && (
                  <a href={invitation.resepsiMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 px-5 py-2 text-sm bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors shadow-sm">
                    📍 Buka Maps
                  </a>
                )}
              </motion.div>
            )}
          </div>

          {/* Fallback single event */}
          {!invitation.akadDate && !invitation.resepsiDate && (
            <motion.div variants={fadeUp} className="text-center p-8 bg-white rounded-2xl shadow-md border border-gray-100 max-w-md mx-auto">
              <p className="text-gray-600 font-medium">
                {new Date(invitation.eventDate).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
              {invitation.eventTime && <p className="text-gray-500 mt-1">{invitation.eventTime} WIB</p>}
              {invitation.locationName && <p className="text-gray-700 font-medium mt-4">{invitation.locationName}</p>}
              {invitation.location && <p className="text-sm text-gray-500 mt-1">{invitation.location}</p>}
              {invitation.mapsUrl && (
                <a href={invitation.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 px-5 py-2 text-sm bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors">
                  📍 Buka Maps
                </a>
              )}
            </motion.div>
          )}

          {/* Save the Date button */}
          <motion.div variants={fadeUp} className="text-center mt-8">
            <button
              onClick={() => saveTheDate(invitation)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-full font-medium hover:bg-amber-700 transition-colors shadow-md cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Save the Date
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════ 5. LOKASI MAPS ═══════════ */}
      {(invitation.akadMapsUrl || invitation.resepsiMapsUrl || invitation.mapsUrl) && (
        <>
          <Divider />
          <section className="py-16 px-6">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-3xl font-serif text-center text-gray-800 mb-10">Lokasi</h2>
              <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                <iframe
                  src={`https://www.google.com/maps?q=${encodeURIComponent(invitation.resepsiMapsUrl || invitation.akadMapsUrl || invitation.mapsUrl || "")}&output=embed`}
                  width="100%"
                  height="350"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi Acara"
                />
              </div>
            </motion.div>
          </section>
        </>
      )}

      {/* ═══════════ 6. GALERI FOTO ═══════════ */}
      {invitation.gallery.length > 0 && (
        <>
          <Divider />
          <section className="py-16 px-6 bg-gradient-to-b from-rose-50/30 to-transparent">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="max-w-4xl mx-auto"
            >
              <motion.h2 variants={fadeUp} className="text-3xl font-serif text-center text-gray-800 mb-10">
                Galeri
              </motion.h2>
              <GallerySection photos={invitation.gallery} />
            </motion.div>
          </section>
        </>
      )}

      {/* ═══════════ 7. LOVE STORY ═══════════ */}
      {invitation.loveStories.length > 0 && (
        <>
          <Divider />
          <section className="py-16 px-6">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="max-w-2xl mx-auto"
            >
              <motion.h2 variants={fadeUp} className="text-3xl font-serif text-center text-gray-800 mb-14">
                Our Love Story
              </motion.h2>

              <div className="relative">
                <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-300 via-rose-300 to-amber-300 transform md:-translate-x-px" />

                {invitation.loveStories.map((story, index) => (
                  <motion.div
                    key={story.id}
                    variants={fadeUp}
                    className={`relative flex items-start mb-10 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                  >
                    <div className="absolute left-5 md:left-1/2 w-4 h-4 bg-amber-500 rounded-full transform -translate-x-[7px] md:-translate-x-[7px] mt-2 border-2 border-white shadow-sm" />
                    <div className={`ml-12 md:ml-0 md:w-[45%] ${index % 2 === 0 ? "md:pr-10" : "md:pl-10"}`}>
                      <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                        {story.date && <p className="text-xs text-amber-600 font-medium mb-1">{story.date}</p>}
                        <h4 className="font-serif font-semibold text-gray-800 text-lg">{story.title}</h4>
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">{story.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        </>
      )}

      {/* ═══════════ 8. GIFT / HADIAH ═══════════ */}
      {invitation.giftAccounts.length > 0 && (
        <>
          <Divider />
          <GiftAccounts accounts={invitation.giftAccounts} />
        </>
      )}

      {/* ═══════════ 9. RSVP / UCAPAN ═══════════ */}
      <Divider />
      <Comments invitationId={invitation.id} comments={invitation.comments} />

      {/* ═══════════ 10. SHARE ═══════════ */}
      <Divider />
      <section className="py-12 px-6 text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-md mx-auto"
        >
          <h3 className="text-xl font-serif text-gray-800 mb-6">Bagikan Undangan</h3>
          <div className="flex flex-wrap justify-center gap-3">
            <ShareButton
              label="Copy Link"
              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
              onClick={() => { navigator.clipboard.writeText(window.location.href); }}
            />
            <ShareButton
              label="WhatsApp"
              className="bg-green-500 text-white hover:bg-green-600"
              onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(`Undangan Pernikahan ${invitation.groomName} & ${invitation.brideName}: ${window.location.href}`)}`, "_blank"); }}
            />
            <ShareButton
              label="Telegram"
              className="bg-blue-500 text-white hover:bg-blue-600"
              onClick={() => { window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Undangan Pernikahan ${invitation.groomName} & ${invitation.brideName}`)}`, "_blank"); }}
            />
          </div>
        </motion.div>
      </section>

      {/* ═══════════ 11. FOOTER ═══════════ */}
      <footer className="py-16 px-6 text-center bg-gradient-to-b from-transparent to-amber-50/50">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <p className="text-gray-500 text-sm mb-3">Terima kasih atas doa & kehadiran Anda</p>
          <p className="text-2xl font-serif text-gray-800">
            {invitation.groomName} & {invitation.brideName}
          </p>
          {invitation.hashtag && (
            <p className="text-sm text-amber-600 mt-3 font-medium">{invitation.hashtag}</p>
          )}
          <p className="text-xs text-gray-400 mt-8">Made with ♥</p>
        </motion.div>
      </footer>

      {/* Music Player */}
      {invitation.musicUrl && <MusicPlayer musicUrl={invitation.musicUrl} />}
    </main>
  );
}

// Helper components
function ShareButton({ label, className, onClick }: { label: string; className: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md ${className}`}
    >
      {label}
    </button>
  );
}

// Countdown helper
function calcCountdown(eventDate: Date) {
  const now = new Date();
  const diff = eventDate.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    isPast: false,
  };
}
