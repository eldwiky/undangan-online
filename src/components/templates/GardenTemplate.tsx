"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SerializedInvitation, SerializedGallery } from "@/app/(public)/[slug]/InvitationClient";

interface GardenTemplateProps {
  invitation: SerializedInvitation;
  guestName?: string | null;
}

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

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

// Couple sketch SVG decoration
function CoupleSketch({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Groom - left side */}
      <path d="M150 180 C150 160 160 140 170 130 C180 120 190 115 195 110 C200 105 200 95 195 85 C190 75 180 70 175 70 C170 70 160 75 155 85 C150 95 150 105 155 110 C145 115 135 125 130 140 C125 155 125 170 130 185 L130 350" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Groom body */}
      <path d="M130 185 C125 200 120 220 120 240 L120 380 M180 185 C185 200 190 220 190 240 L190 380" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Groom arm */}
      <path d="M180 220 C190 225 200 230 210 235" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      
      {/* Bride - right side */}
      <path d="M250 170 C250 150 255 135 260 125 C265 115 270 110 275 105 C280 100 280 90 275 80 C270 70 260 65 255 65 C250 65 240 70 235 80 C230 90 230 100 235 105 C240 110 245 115 250 125" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Bride hair */}
      <path d="M235 75 C230 70 228 60 232 52 C236 44 245 40 255 40 C265 40 274 44 278 52 C282 60 280 70 275 75" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
      <path d="M232 65 C228 75 225 90 228 100 M278 65 C282 75 285 90 282 100" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      {/* Bride body/dress */}
      <path d="M220 185 C210 220 200 260 190 300 C180 340 175 370 175 400 M290 185 C300 220 310 260 320 300 C330 340 335 370 335 400" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Dress flow */}
      <path d="M175 400 C200 405 230 410 255 410 C280 410 310 405 335 400" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Couple holding hands */}
      <path d="M180 235 C195 240 210 240 225 235" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      
      {/* Flowers at bottom */}
      <circle cx="160" cy="430" r="8" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
      <circle cx="160" cy="430" r="3" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
      <circle cx="200" cy="445" r="10" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      <circle cx="200" cy="445" r="4" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      <circle cx="250" cy="435" r="8" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
      <circle cx="250" cy="435" r="3" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
      <circle cx="300" cy="440" r="9" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      <circle cx="300" cy="440" r="3.5" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      
      {/* Leaves */}
      <path d="M140 420 C145 415 155 412 160 415 C155 418 145 420 140 420Z" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/>
      <path d="M280 425 C285 420 295 417 300 420 C295 423 285 425 280 425Z" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/>
    </svg>
  );
}

// ICS file download helper
function downloadICS(invitation: SerializedInvitation) {
  const title = `Pernikahan ${invitation.groomName} & ${invitation.brideName}`;
  const eventDate = invitation.akadDate || invitation.eventDate;
  const date = new Date(eventDate);
  
  // Format: YYYYMMDDTHHmmss
  const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  
  const startStr = formatDate(date);
  const endDate = new Date(date.getTime() + 3 * 60 * 60 * 1000);
  const endStr = formatDate(endDate);
  
  const location = invitation.akadLocationName || invitation.resepsiLocationName || invitation.locationName || "";
  const description = `Undangan pernikahan ${invitation.groomName} & ${invitation.brideName}`;

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Web Undangan//ID",
    "BEGIN:VEVENT",
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
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

// Wavy section divider
function WavyDivider() {
  return (
    <div className="relative h-16 overflow-hidden">
      <svg
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        className="absolute bottom-0 w-full h-full"
      >
        <path
          d="M0,30 C200,60 400,0 600,30 C800,60 1000,0 1200,30 L1200,60 L0,60 Z"
          fill="currentColor"
          className="text-[#5c6b4f]/10"
        />
      </svg>
    </div>
  );
}

// Daisy decoration component
function DaisyDecoration({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-block text-2xl ${className}`} aria-hidden="true">
      🌼
    </span>
  );
}

// Floating petals
function FloatingPetals() {
  const petals = Array.from({ length: 8 }, (_, i) => i);
  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {petals.map((i) => (
        <span
          key={i}
          className="absolute animate-petal text-lg opacity-60"
          style={{
            left: `${10 + i * 12}%`,
            animationDelay: `${i * 1.2}s`,
            animationDuration: `${7 + (i % 3) * 2}s`,
          }}
          aria-hidden="true"
        >
          {i % 2 === 0 ? "🌼" : "🍃"}
        </span>
      ))}
    </div>
  );
}

// Gallery with lightbox
function GardenGallery({ photos }: { photos: SerializedGallery[] }) {
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
            className="aspect-square rounded-[20px] overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow border-2 border-white/50"
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
              aria-label="Tutup preview"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Countdown
function GardenCountdown({ eventDate }: { eventDate: string }) {
  const [countdown, setCountdown] = useState(calcCountdown(new Date(eventDate)));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(calcCountdown(new Date(eventDate)));
    }, 1000);
    return () => clearInterval(interval);
  }, [eventDate]);

  if (countdown.isPast) {
    return (
      <p className="text-white/80 italic text-center font-serif text-lg">
        Acara telah berlangsung
      </p>
    );
  }

  const units = [
    { value: countdown.days, label: "Hari" },
    { value: countdown.hours, label: "Jam" },
    { value: countdown.minutes, label: "Menit" },
    { value: countdown.seconds, label: "Detik" },
  ];

  return (
    <div className="flex justify-center gap-3 sm:gap-4">
      {units.map((unit) => (
        <div
          key={unit.label}
          className="text-center bg-white/15 backdrop-blur-sm rounded-2xl p-3 sm:p-4 min-w-[65px] border border-white/20"
        >
          <div className="text-2xl sm:text-3xl font-bold text-white font-serif">
            {unit.value}
          </div>
          <div className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider mt-1">
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GardenTemplate({ invitation, guestName }: GardenTemplateProps) {
  const [isOpened, setIsOpened] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [commentName, setCommentName] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [commentAttendance, setCommentAttendance] = useState("hadir");
  const [comments, setComments] = useState(invitation.comments);
  const [submitting, setSubmitting] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio setup
  useEffect(() => {
    if (invitation.musicUrl && isOpened) {
      const audio = new Audio(invitation.musicUrl);
      audio.loop = true;
      audio.volume = 0.7;
      audioRef.current = audio;

      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });

      return () => {
        audio.pause();
        audio.src = "";
      };
    }
  }, [invitation.musicUrl, isOpened]);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentMessage.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/invitations/${invitation.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: commentName,
          message: commentMessage,
          attendance: commentAttendance,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setComments((prev) => [json.data, ...prev]);
        setCommentName("");
        setCommentMessage("");
      }
    } catch {
      // silent fail
    } finally {
      setSubmitting(false);
    }
  };

  const copyAccount = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(id);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  // ═══════════ OPENING SCREEN ═══════════
  if (!isOpened) {
    return (
      <div className="min-h-screen bg-[#5c6b4f] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
        {/* Couple sketch background decoration */}
        <CoupleSketch className="absolute inset-0 w-full h-full text-white/15 pointer-events-none" />

        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-6xl">🌼</div>
          <div className="absolute top-20 right-16 text-4xl">🌿</div>
          <div className="absolute bottom-32 left-8 text-5xl">🍃</div>
          <div className="absolute bottom-20 right-10 text-6xl">🌼</div>
          <div className="absolute top-1/2 left-1/4 text-3xl">🌸</div>
          <div className="absolute top-1/3 right-1/4 text-4xl">🌿</div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10"
        >
          <p className="text-white/70 text-sm tracking-[0.3em] uppercase mb-4">
            The Wedding of
          </p>
          <h1
            className="text-5xl sm:text-6xl md:text-7xl text-white mb-2"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            {invitation.groomName}
          </h1>
          <p className="text-white/80 text-2xl my-2">&</p>
          <h1
            className="text-5xl sm:text-6xl md:text-7xl text-white mb-8"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            {invitation.brideName}
          </h1>

          <p className="text-white/70 text-sm mb-2">
            {new Date(invitation.eventDate).toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          {guestName && (
            <div className="mt-6 mb-4">
              <p className="text-white/60 text-xs uppercase tracking-wider">Kepada Yth.</p>
              <p className="text-white text-lg font-medium mt-1">{guestName}</p>
            </div>
          )}

          {/* Daisy row */}
          <div className="flex justify-center gap-2 my-6">
            <DaisyDecoration className="opacity-60" />
            <DaisyDecoration className="opacity-80" />
            <DaisyDecoration />
            <DaisyDecoration className="opacity-80" />
            <DaisyDecoration className="opacity-60" />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpened(true)}
            className="px-8 py-3 bg-white text-[#5c6b4f] rounded-full font-medium shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            Buka Undangan
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ═══════════ MAIN CONTENT ═══════════
  return (
    <main className="min-h-screen bg-[#5c6b4f] overflow-hidden relative">
      {/* Floating petals */}
      <FloatingPetals />

      {/* Google Fonts link for Dancing Script */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap"
        rel="stylesheet"
      />

      {/* ═══════════ 1. HERO SECTION ═══════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#4a5940] via-[#5c6b4f] to-[#6b7a5e]" />

        {/* Couple sketch background decoration */}
        <CoupleSketch className="absolute inset-0 w-full h-full text-white/[0.08] pointer-events-none" />

        {/* Decorative elements */}
        <div className="absolute top-8 left-6 text-4xl opacity-30 animate-float">🌼</div>
        <div className="absolute top-16 right-8 text-3xl opacity-20 animate-float-slow">🍃</div>
        <div className="absolute bottom-24 left-10 text-3xl opacity-25 animate-float-reverse">🌿</div>
        <div className="absolute bottom-16 right-6 text-4xl opacity-30 animate-float">🌼</div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="relative z-10"
        >
          <motion.p variants={fadeIn} className="text-white/60 text-sm tracking-[0.3em] uppercase mb-6">
            The Wedding of
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-7xl text-white mb-3"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            {invitation.groomName} & {invitation.brideName}
          </motion.h1>
          <motion.div variants={fadeIn} className="flex justify-center gap-2 my-6">
            <span className="h-px w-12 bg-white/40 self-center" />
            <DaisyDecoration className="text-xl" />
            <span className="h-px w-12 bg-white/40 self-center" />
          </motion.div>
          <motion.p variants={fadeUp} className="text-white/70 text-base">
            {new Date(invitation.eventDate).toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </motion.p>
          {invitation.hashtag && (
            <motion.p variants={fadeIn} className="text-[#c9a96e] text-sm mt-4 font-medium">
              {invitation.hashtag}
            </motion.p>
          )}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-white/60 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>


      {/* ═══════════ 2. AYAT / BISMILLAH ═══════════ */}
      {(invitation.quoteText || invitation.quoteArabic) && (
        <section className="py-20 px-6 bg-[#4a5940]">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-xl mx-auto text-center"
          >
            <span className="text-[#c9a96e] text-3xl block mb-6">❝</span>
            {invitation.quoteArabic && (
              <p dir="rtl" className="text-2xl md:text-3xl text-white leading-loose mb-6 font-serif">
                {invitation.quoteArabic}
              </p>
            )}
            {invitation.quoteLatin && (
              <p className="text-sm text-white/60 italic mb-4">
                {invitation.quoteLatin}
              </p>
            )}
            {invitation.quoteText && (
              <p className="text-lg text-white/90 leading-relaxed font-serif">
                {invitation.quoteText}
              </p>
            )}
            {invitation.quoteSource && (
              <p className="mt-6 text-sm text-[#c9a96e] font-medium tracking-wide">
                — {invitation.quoteSource}
              </p>
            )}
          </motion.div>
        </section>
      )}

      <WavyDivider />

      {/* ═══════════ 3. MEMPELAI ═══════════ */}
      <section className="py-16 px-6 bg-[#5c6b4f]">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <motion.h2
            variants={fadeUp}
            className="text-3xl text-center text-white mb-14"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            Mempelai
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            {/* Pria */}
            <motion.div
              variants={fadeUp}
              className="text-center bg-[#fefdf8] rounded-[30px] p-8 shadow-lg"
              style={{ borderRadius: "30px 30px 60px 30px" }}
            >
              {invitation.groomPhoto ? (
                <div className="w-36 h-36 mx-auto mb-5 rounded-full overflow-hidden border-4 border-[#c9a96e] shadow-lg">
                  <img src={invitation.groomPhoto} alt={invitation.groomName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-36 h-36 mx-auto mb-5 rounded-full bg-gradient-to-br from-[#6b7a5e] to-[#5c6b4f] flex items-center justify-center shadow-lg border-4 border-[#c9a96e]">
                  <span className="text-4xl">🤵</span>
                </div>
              )}
              <h3
                className="text-2xl text-[#4a5940] mb-1"
                style={{ fontFamily: "'Dancing Script', cursive" }}
              >
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
            <motion.div
              variants={fadeUp}
              className="text-center bg-[#fefdf8] rounded-[30px] p-8 shadow-lg"
              style={{ borderRadius: "30px 30px 30px 60px" }}
            >
              {invitation.bridePhoto ? (
                <div className="w-36 h-36 mx-auto mb-5 rounded-full overflow-hidden border-4 border-[#c9a96e] shadow-lg">
                  <img src={invitation.bridePhoto} alt={invitation.brideName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-36 h-36 mx-auto mb-5 rounded-full bg-gradient-to-br from-[#6b7a5e] to-[#5c6b4f] flex items-center justify-center shadow-lg border-4 border-[#c9a96e]">
                  <span className="text-4xl">👰</span>
                </div>
              )}
              <h3
                className="text-2xl text-[#4a5940] mb-1"
                style={{ fontFamily: "'Dancing Script', cursive" }}
              >
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

      <WavyDivider />

      {/* ═══════════ 4. COUNTDOWN ═══════════ */}
      <section className="py-16 px-6 bg-[#4a5940]">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <motion.h2
            variants={fadeUp}
            className="text-3xl text-white mb-10"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            Menghitung Hari
          </motion.h2>
          <motion.div variants={fadeUp}>
            <GardenCountdown eventDate={invitation.eventDate} />
          </motion.div>
        </motion.div>
      </section>

      <WavyDivider />


      {/* ═══════════ 5. ACARA ═══════════ */}
      <section className="py-16 px-6 bg-[#5c6b4f]">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <motion.h2
            variants={fadeUp}
            className="text-3xl text-center text-white mb-12"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            Acara Pernikahan
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(invitation.akadDate || invitation.akadTime) && (
              <motion.div
                variants={fadeUp}
                className="text-center p-8 bg-[#fefdf8] rounded-[24px] shadow-lg border-2 border-[#c9a96e]/20"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-[#5c6b4f]/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💍</span>
                </div>
                <h3 className="text-xl font-serif text-[#4a5940] mb-4 font-semibold">Akad Nikah</h3>
                {invitation.akadDate && (
                  <p className="text-gray-700 font-medium">
                    {new Date(invitation.akadDate).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
                {invitation.akadTime && (
                  <p className="text-gray-500 mt-1">Pukul {invitation.akadTime}</p>
                )}
                {invitation.akadLocationName && (
                  <p className="text-gray-700 font-medium mt-4">{invitation.akadLocationName}</p>
                )}
                {invitation.akadLocation && (
                  <p className="text-sm text-gray-500 mt-1">{invitation.akadLocation}</p>
                )}
                {invitation.akadMapsUrl && (
                  <a
                    href={invitation.akadMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 px-5 py-2 text-sm bg-[#5c6b4f] text-white rounded-full hover:bg-[#4a5940] transition-colors shadow-sm"
                  >
                    📍 Buka Maps
                  </a>
                )}
              </motion.div>
            )}

            {(invitation.resepsiDate || invitation.resepsiTime) && (
              <motion.div
                variants={fadeUp}
                className="text-center p-8 bg-[#fefdf8] rounded-[24px] shadow-lg border-2 border-[#c9a96e]/20"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-[#5c6b4f]/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎉</span>
                </div>
                <h3 className="text-xl font-serif text-[#4a5940] mb-4 font-semibold">Resepsi</h3>
                {invitation.resepsiDate && (
                  <p className="text-gray-700 font-medium">
                    {new Date(invitation.resepsiDate).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
                {invitation.resepsiTime && (
                  <p className="text-gray-500 mt-1">Pukul {invitation.resepsiTime}</p>
                )}
                {invitation.resepsiLocationName && (
                  <p className="text-gray-700 font-medium mt-4">{invitation.resepsiLocationName}</p>
                )}
                {invitation.resepsiLocation && (
                  <p className="text-sm text-gray-500 mt-1">{invitation.resepsiLocation}</p>
                )}
                {invitation.resepsiMapsUrl && (
                  <a
                    href={invitation.resepsiMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 px-5 py-2 text-sm bg-[#5c6b4f] text-white rounded-full hover:bg-[#4a5940] transition-colors shadow-sm"
                  >
                    📍 Buka Maps
                  </a>
                )}
              </motion.div>
            )}
          </div>

          {/* Fallback single event */}
          {!invitation.akadDate && !invitation.resepsiDate && (
            <motion.div
              variants={fadeUp}
              className="text-center p-8 bg-[#fefdf8] rounded-[24px] shadow-lg max-w-md mx-auto border-2 border-[#c9a96e]/20"
            >
              <p className="text-gray-700 font-medium">
                {new Date(invitation.eventDate).toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {invitation.eventTime && <p className="text-gray-500 mt-1">Pukul {invitation.eventTime}</p>}
              {invitation.locationName && <p className="text-gray-700 font-medium mt-4">{invitation.locationName}</p>}
              {invitation.location && <p className="text-sm text-gray-500 mt-1">{invitation.location}</p>}
              {invitation.mapsUrl && (
                <a
                  href={invitation.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 px-5 py-2 text-sm bg-[#5c6b4f] text-white rounded-full hover:bg-[#4a5940] transition-colors"
                >
                  📍 Buka Maps
                </a>
              )}
            </motion.div>
          )}

          {/* Save the Date button */}
          <motion.div variants={fadeUp} className="text-center mt-8">
            <button
              onClick={() => downloadICS(invitation)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#5c6b4f] rounded-full shadow-md hover:shadow-lg transition-all font-medium cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Save the Date
            </button>
          </motion.div>
        </motion.div>
      </section>

      <WavyDivider />

      {/* ═══════════ 6. LOVE STORY ═══════════ */}
      {invitation.loveStories.length > 0 && (
        <>
          <section className="py-16 px-6 bg-[#4a5940]">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="max-w-2xl mx-auto"
            >
              <motion.h2
                variants={fadeUp}
                className="text-3xl text-center text-white mb-14"
                style={{ fontFamily: "'Dancing Script', cursive" }}
              >
                Our Love Story
              </motion.h2>

              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#c9a96e] via-white/30 to-[#c9a96e]" />

                {invitation.loveStories.map((story) => (
                  <motion.div
                    key={story.id}
                    variants={fadeUp}
                    className="relative flex items-start mb-8 ml-12"
                  >
                    {/* Daisy dot */}
                    <div className="absolute -left-[39px] w-6 h-6 flex items-center justify-center">
                      <span className="text-sm">🌼</span>
                    </div>
                    <div className="bg-[#fefdf8] p-5 rounded-[20px] shadow-md w-full border border-[#c9a96e]/20">
                      {story.date && (
                        <p className="text-xs text-[#c9a96e] font-medium mb-1">{story.date}</p>
                      )}
                      <h4 className="font-serif font-semibold text-[#4a5940] text-lg">
                        {story.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                        {story.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
          <WavyDivider />
        </>
      )}


      {/* ═══════════ 7. GALERI ═══════════ */}
      {invitation.gallery.length > 0 && (
        <>
          <section className="py-16 px-6 bg-[#5c6b4f]">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="max-w-4xl mx-auto"
            >
              <motion.h2
                variants={fadeUp}
                className="text-3xl text-center text-white mb-10"
                style={{ fontFamily: "'Dancing Script', cursive" }}
              >
                Galeri
              </motion.h2>
              <GardenGallery photos={invitation.gallery} />
            </motion.div>
          </section>
          <WavyDivider />
        </>
      )}

      {/* ═══════════ 8. HADIAH ═══════════ */}
      {invitation.giftAccounts.length > 0 && (
        <>
          <section className="py-16 px-6 bg-[#4a5940]">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="max-w-lg mx-auto"
            >
              <motion.h2
                variants={fadeUp}
                className="text-3xl text-center text-white mb-4"
                style={{ fontFamily: "'Dancing Script', cursive" }}
              >
                Hadiah
              </motion.h2>
              <motion.p variants={fadeIn} className="text-center text-white/70 text-sm mb-10">
                Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika Anda ingin memberikan tanda kasih, kami menyediakan informasi berikut.
              </motion.p>

              <div className="space-y-4">
                {invitation.giftAccounts.map((account) => (
                  <motion.div
                    key={account.id}
                    variants={fadeUp}
                    className="bg-[#fefdf8] rounded-[20px] p-6 shadow-md border border-[#c9a96e]/20"
                  >
                    <p className="text-sm text-gray-500 font-medium">{account.bankName}</p>
                    <p className="text-lg font-mono text-[#4a5940] font-bold mt-1">
                      {account.accountNumber}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">a.n. {account.accountHolder}</p>
                    <button
                      onClick={() => copyAccount(account.accountNumber, account.id)}
                      className="mt-3 px-4 py-1.5 text-xs bg-[#5c6b4f] text-white rounded-full hover:bg-[#4a5940] transition-colors cursor-pointer"
                    >
                      {copiedAccount === account.id ? "✓ Tersalin" : "Salin Nomor"}
                    </button>
                    {account.qrisUrl && (
                      <div className="mt-4">
                        <img
                          src={account.qrisUrl}
                          alt="QRIS"
                          className="w-40 h-40 mx-auto rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
          <WavyDivider />
        </>
      )}

      {/* ═══════════ 9. RSVP & UCAPAN ═══════════ */}
      <section className="py-16 px-6 bg-[#5c6b4f]">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-lg mx-auto"
        >
          <motion.h2
            variants={fadeUp}
            className="text-3xl text-center text-white mb-10"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            Ucapan & Doa
          </motion.h2>

          {/* Form */}
          <motion.form
            variants={fadeUp}
            onSubmit={handleComment}
            className="bg-[#fefdf8] rounded-[24px] p-6 shadow-lg mb-8 border border-[#c9a96e]/20"
          >
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Nama Anda"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5c6b4f] focus:border-[#5c6b4f] outline-none text-sm bg-white"
                  required
                />
              </div>
              <div>
                <textarea
                  placeholder="Tulis ucapan & doa..."
                  value={commentMessage}
                  onChange={(e) => setCommentMessage(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5c6b4f] focus:border-[#5c6b4f] outline-none text-sm resize-none bg-white"
                  required
                />
              </div>
              <div>
                <select
                  value={commentAttendance}
                  onChange={(e) => setCommentAttendance(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5c6b4f] focus:border-[#5c6b4f] outline-none text-sm bg-white"
                >
                  <option value="hadir">Hadir</option>
                  <option value="tidak_hadir">Tidak Hadir</option>
                  <option value="ragu">Masih Ragu</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#5c6b4f] text-white rounded-xl hover:bg-[#4a5940] transition-colors font-medium disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {submitting ? "Mengirim..." : "Kirim Ucapan"}
              </button>
            </div>
          </motion.form>

          {/* Comments list */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                variants={fadeUp}
                className="bg-white/10 backdrop-blur-sm rounded-[16px] p-4 border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium text-sm">{comment.guestName}</p>
                  <span className="text-[10px] text-white/50">
                    {new Date(comment.createdAt).toLocaleDateString("id-ID")}
                  </span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">{comment.message}</p>
                <p className="text-[10px] text-[#c9a96e] mt-2 capitalize">
                  {comment.attendance === "hadir" ? "✓ Hadir" : comment.attendance === "tidak_hadir" ? "✗ Tidak Hadir" : "? Ragu-ragu"}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>


      {/* ═══════════ 10. FOOTER ═══════════ */}
      <footer className="py-16 px-6 text-center bg-[#4a5940]">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Daisy decorations */}
          <div className="flex justify-center gap-2 mb-6">
            <DaisyDecoration className="opacity-50 text-lg" />
            <DaisyDecoration className="opacity-70 text-xl" />
            <DaisyDecoration className="text-2xl" />
            <DaisyDecoration className="opacity-70 text-xl" />
            <DaisyDecoration className="opacity-50 text-lg" />
          </div>

          <p className="text-white/60 text-sm mb-3">Terima kasih atas doa & kehadiran Anda</p>
          <p
            className="text-3xl text-white"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            {invitation.groomName} & {invitation.brideName}
          </p>
          {invitation.hashtag && (
            <p className="text-sm text-[#c9a96e] mt-4 font-medium">{invitation.hashtag}</p>
          )}
          <p className="text-xs text-white/30 mt-10">Made with 🌼</p>
        </motion.div>
      </footer>

      {/* ═══════════ FLOATING MUSIC PLAYER ═══════════ */}
      {invitation.musicUrl && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          onClick={toggleMusic}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center shadow-lg hover:bg-white/30 transition-colors cursor-pointer"
          aria-label={isPlaying ? "Pause musik" : "Play musik"}
        >
          {isPlaying ? (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </motion.button>
      )}
    </main>
  );
}
