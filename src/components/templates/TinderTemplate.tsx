"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SerializedInvitation, SerializedComment } from "@/app/(public)/[slug]/InvitationClient";
import { calculateCountdown } from "@/lib/utils";
import MusicPlayer from "@/components/invitation/MusicPlayer";
import Confetti from "@/components/invitation/Confetti";
import FallingPetals from "@/components/invitation/FallingPetals";
import ScrollDots from "@/components/invitation/ScrollDots";
import TypewriterText from "@/components/invitation/TypewriterText";
import { playConfettiSound } from "@/lib/sounds";

// ═══════════ COLOR CONSTANTS ═══════════
const COLORS = {
  primary: "#FD267A",
  secondary: "#FF6036",
  dark: "#1A1A2E",
  lightBg: "#F5F5F5",
  white: "#FFFFFF",
  textMuted: "#6B7280",
} as const;

// ═══════════ INDONESIAN DATE HELPERS ═══════════
const INDONESIAN_DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const INDONESIAN_MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function formatIndonesianDate(dateStr: string): string {
  const date = new Date(dateStr);
  const dayName = INDONESIAN_DAYS[date.getDay()];
  const day = date.getDate();
  const month = INDONESIAN_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${day} ${month} ${year}`;
}

function formatEventTime(startTime: string | null, endTime: string | null): string {
  if (!startTime) return "";
  if (endTime) return `${startTime} - ${endTime} WIB`;
  return `${startTime} WIB`;
}

function isEventPast(dateStr: string): boolean {
  const eventDate = new Date(dateStr);
  const now = new Date();
  eventDate.setHours(23, 59, 59, 999);
  return now > eventDate;
}

function generateGoogleCalendarUrl(
  title: string,
  dateStr: string,
  startTime: string | null,
  endTime: string | null,
  venue: string | null,
  address: string | null
): string {
  const date = new Date(dateStr);
  const [startH, startM] = (startTime || "08:00").split(":").map(Number);
  const [endH, endM] = (endTime || "12:00").split(":").map(Number);
  const startDate = new Date(date);
  startDate.setHours(startH, startM, 0, 0);
  const endDate = new Date(date);
  endDate.setHours(endH, endM, 0, 0);
  const formatGCal = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const location = [venue, address].filter(Boolean).join(", ");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatGCal(startDate)}/${formatGCal(endDate)}&details=${encodeURIComponent(`Undangan Pernikahan`)}&location=${encodeURIComponent(location)}`;
}

function generateICSContent(
  title: string,
  dateStr: string,
  startTime: string | null,
  endTime: string | null,
  venue: string | null,
  address: string | null
): string {
  const date = new Date(dateStr);
  const [startH, startM] = (startTime || "08:00").split(":").map(Number);
  const [endH, endM] = (endTime || "12:00").split(":").map(Number);
  const startDate = new Date(date);
  startDate.setHours(startH, startM, 0, 0);
  const endDate = new Date(date);
  endDate.setHours(endH, endM, 0, 0);
  const formatICS = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const location = [venue, address].filter(Boolean).join(", ");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Web Undangan//ID",
    "BEGIN:VEVENT",
    `DTSTART:${formatICS(startDate)}`,
    `DTEND:${formatICS(endDate)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:Undangan Pernikahan`,
    `LOCATION:${location}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function handleSaveTheDate(
  groomName: string,
  brideName: string,
  dateStr: string,
  startTime: string | null,
  endTime: string | null,
  venue: string | null,
  address: string | null
) {
  const title = `Pernikahan ${groomName} & ${brideName}`;
  const isAndroid = /android/i.test(navigator.userAgent);
  if (isAndroid) {
    const gcalUrl = generateGoogleCalendarUrl(title, dateStr, startTime, endTime, venue, address);
    window.open(gcalUrl, "_blank");
  } else {
    const icsContent = generateICSContent(title, dateStr, startTime, endTime, venue, address);
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${groomName}-${brideName}-wedding.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// ═══════════ INTERFACES ═══════════
interface TinderTemplateProps {
  invitation: SerializedInvitation;
  guestName?: string | null;
}

// ═══════════ FLOATING HEARTS BACKGROUND ═══════════
function FloatingHearts() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-white/20 text-2xl"
          initial={{ y: "100vh", x: `${15 + i * 15}%`, opacity: 0 }}
          animate={{ y: "-10vh", opacity: [0, 0.6, 0] }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeOut",
          }}
        >
          ♥
        </motion.div>
      ))}
    </div>
  );
}

// ═══════════ OPENING SCREEN ═══════════
function TinderOpeningScreen({
  invitation,
  guestName,
  onOpen,
}: {
  invitation: SerializedInvitation;
  guestName?: string | null;
  onOpen: () => void;
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-4"
      style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
    >
      <FloatingHearts />

      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
      >
        {/* Photo area */}
        {invitation.groomPhoto ? (
          <div className="w-full h-64 overflow-hidden">
            <img
              src={invitation.groomPhoto}
              alt={invitation.groomName}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            className="w-full h-64 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${COLORS.primary}20, ${COLORS.secondary}20)` }}
          >
            <span className="text-6xl">💑</span>
          </div>
        )}

        {/* Card content */}
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {invitation.groomName} ❤️ {invitation.brideName}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {formatIndonesianDate(invitation.eventDate)}
          </p>

          {guestName && (
            <div className="mt-4 py-2 px-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-400">Kepada,</p>
              <p className="text-sm font-semibold text-gray-700">
                <TypewriterText text={guestName} speed={80} delay={500} />
              </p>
            </div>
          )}

          <button
            onClick={onOpen}
            className="mt-6 w-full py-3 rounded-full text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
          >
            Swipe Right 💕
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════ "IT'S A MATCH!" TRANSITION ═══════════
function MatchTransition({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
    >
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="text-center"
      >
        <motion.p
          className="text-5xl md:text-6xl font-bold text-white"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.6, repeat: 1 }}
        >
          It&apos;s a Match! 🎉
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

// ═══════════ COUNTDOWN SECTION ═══════════
function TinderCountdown({ eventDate, onReachZero }: { eventDate: string; onReachZero?: () => void }) {
  const [countdown, setCountdown] = useState(calculateCountdown(new Date(eventDate)));
  const wasPastRef = useRef(countdown.isPast);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(calculateCountdown(new Date(eventDate)));
    }, 1000);
    return () => clearInterval(interval);
  }, [eventDate]);

  useEffect(() => {
    if (countdown.isPast && !wasPastRef.current) {
      onReachZero?.();
    }
    wasPastRef.current = countdown.isPast;
  }, [countdown.isPast, onReachZero]);

  if (countdown.isPast) {
    return (
      <p className="text-gray-500 italic text-center text-sm">
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
    <div className="flex justify-center gap-3">
      {units.map((unit) => (
        <div key={unit.label} className="text-center">
          <div
            className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text"
            style={{ backgroundImage: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
          >
            {unit.value}
          </div>
          <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mt-1">
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════ GALLERY SECTION ═══════════
function TinderGallery({ gallery }: { gallery: SerializedInvitation["gallery"] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (gallery.length === 0) return null;

  const sorted = [...gallery].sort((a, b) => a.order - b.order);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {sorted.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="aspect-square rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow"
              onClick={() => setSelectedIndex(i)}
            >
              <img
                src={photo.imageUrl}
                alt={`Foto ${i + 1}`}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
            </motion.div>
          ))}
      </div>

      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelectedIndex(null)}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white text-xl hover:bg-white/30"
            >
              ✕
            </button>

            {/* Previous button */}
            {selectedIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedIndex(selectedIndex - 1); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Previous photo"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
            )}

            {/* Next button */}
            {selectedIndex < sorted.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedIndex(selectedIndex + 1); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Next photo"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            )}

            <motion.img
              key={sorted[selectedIndex].id}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={sorted[selectedIndex].imageUrl}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -100 && selectedIndex < sorted.length - 1) {
                  setSelectedIndex(selectedIndex + 1);
                } else if (info.offset.x > 100 && selectedIndex > 0) {
                  setSelectedIndex(selectedIndex - 1);
                }
              }}
            />

            {/* Photo counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
              {selectedIndex + 1} / {sorted.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ═══════════ LOVE STORY SECTION ═══════════
function TinderLoveStory({ stories }: { stories: SerializedInvitation["loveStories"] }) {
  if (stories.length === 0) return null;

  const sorted = [...stories].sort((a, b) => a.order - b.order);

  return (
    <div className="relative">
      {/* Connector line */}
      <div
        className="absolute left-5 top-0 bottom-0 w-0.5"
        style={{ background: `linear-gradient(to bottom, ${COLORS.primary}, ${COLORS.secondary})` }}
      />

      <div className="space-y-8">
        {sorted.map((story, index) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative pl-12"
          >
            {/* Dot */}
            <div
              className="absolute left-[14px] top-2 w-3 h-3 rounded-full border-2 border-white shadow-sm"
              style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
            />

            <div className="bg-white rounded-xl p-4 shadow-md">
              {story.imageUrl && (
                <img
                  src={story.imageUrl}
                  alt={story.title}
                  className="w-20 h-20 rounded-lg object-cover mb-3"
                />
              )}
              {story.date && (
                <p className="text-xs font-medium mb-1" style={{ color: COLORS.primary }}>
                  {story.date}
                </p>
              )}
              <h4 className="font-bold text-gray-800">{story.title}</h4>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">{story.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ═══════════ COMMENTS SECTION ═══════════
function TinderComments({ invitationId, comments: initialComments }: { invitationId: string; comments: SerializedComment[] }) {
  const [comments, setComments] = useState<SerializedComment[]>(
    [...initialComments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  );
  const [form, setForm] = useState({
    guestName: "",
    message: "",
    attendance: "Hadir" as "Hadir" | "Tidak Hadir",
  });
  const [errors, setErrors] = useState<{ guestName?: string; message?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto-poll comments every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/invitations/${invitationId}/comments?page=1&_t=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            setComments(
              [...json.data].sort((a: SerializedComment, b: SerializedComment) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )
            );
          }
        }
      } catch {
        // Silent fail
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [invitationId]);

  const validate = useCallback((): boolean => {
    const newErrors: { guestName?: string; message?: string } = {};
    if (!form.guestName.trim()) newErrors.guestName = "Nama wajib diisi";
    if (!form.message.trim()) newErrors.message = "Pesan wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form.guestName, form.message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(false);
    setSubmitError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/invitations/${invitationId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: form.guestName,
          message: form.message,
          attendance: form.attendance === "Hadir" ? "hadir" : "tidak_hadir",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal mengirim, coba lagi");
      }

      setForm({ guestName: "", message: "", attendance: "Hadir" });
      setErrors({});
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);

      // Immediately fetch fresh comments
      const freshRes = await fetch(`/api/invitations/${invitationId}/comments?page=1&_t=${Date.now()}`);
      if (freshRes.ok) {
        const freshJson = await freshRes.json();
        if (freshJson.data && Array.isArray(freshJson.data)) {
          setComments(
            [...freshJson.data].sort((a: SerializedComment, b: SerializedComment) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
          );
        }
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Gagal mengirim, coba lagi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAttendanceLabel = (attendance: string) => {
    switch (attendance) {
      case "hadir": return "✓ Hadir";
      case "tidak_hadir": return "✗ Tidak Hadir";
      default: return attendance;
    }
  };

  return (
    <div>
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <input
            type="text"
            value={form.guestName}
            onChange={(e) => setForm((prev) => ({ ...prev, guestName: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
            placeholder="Nama Anda"
            maxLength={100}
          />
          {errors.guestName && <p className="text-xs text-red-500 mt-1">{errors.guestName}</p>}
        </div>
        <div>
          <textarea
            value={form.message}
            onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm resize-none"
            rows={3}
            placeholder="Tulis ucapan & doa..."
            maxLength={500}
          />
          {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
        </div>
        <div className="flex gap-2">
          {(["Hadir", "Tidak Hadir"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, attendance: option }))}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                form.attendance === option
                  ? "text-white shadow-md"
                  : "text-gray-600 bg-gray-100 hover:bg-gray-200"
              }`}
              style={form.attendance === option ? { background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` } : {}}
            >
              {option}
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-full text-white font-medium text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
        >
          {isSubmitting ? "Mengirim..." : "Kirim Ucapan 💌"}
        </button>
        {submitSuccess && <p className="text-sm text-center text-green-600">Ucapan berhasil dikirim!</p>}
        {submitError && <p className="text-sm text-center text-red-500">{submitError}</p>}
      </form>

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-sm text-gray-800">{comment.guestName}</p>
                <span className="text-xs" style={{ color: COLORS.primary }}>
                  {getAttendanceLabel(comment.attendance)}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{comment.message}</p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(comment.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-gray-400">Belum ada ucapan. Jadilah yang pertama!</p>
      )}
    </div>
  );
}

// ═══════════ GIFT SECTION ═══════════
function TinderGift({ invitation }: { invitation: SerializedInvitation }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (invitation.giftAccounts.length === 0) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {invitation.giftAccounts.map((account) => (
        <div key={account.id} className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-800">{account.bankName}</p>
          <p className="text-sm text-gray-600 mt-1">{account.accountHolder}</p>
          <div className="flex items-center gap-2 mt-2">
            <code className="text-sm bg-white px-3 py-1.5 rounded-lg border border-gray-200 flex-1">
              {account.accountNumber}
            </code>
            <button
              onClick={() => handleCopy(account.accountNumber, account.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all"
              style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
            >
              {copiedId === account.id ? "Tersalin!" : "Salin"}
            </button>
          </div>
          {account.qrisUrl && (
            <div className="mt-3">
              <img
                src={account.qrisUrl}
                alt="QRIS"
                className="w-48 h-48 mx-auto rounded-lg border border-gray-200"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ═══════════ SCROLL SECTIONS ═══════════
const TINDER_SCROLL_SECTIONS = [
  { id: "quote", label: "Ayat" },
  { id: "couple", label: "Mempelai" },
  { id: "countdown", label: "Countdown" },
  { id: "events", label: "Acara" },
  { id: "gallery", label: "Galeri" },
  { id: "story", label: "Love Story" },
  { id: "comments", label: "Ucapan" },
  { id: "gift", label: "Hadiah" },
];

// ═══════════ MAIN TEMPLATE COMPONENT ═══════════
export default function TinderTemplate({ invitation, guestName }: TinderTemplateProps) {
  const [phase, setPhase] = useState<"opening" | "match" | "content">("opening");
  const [showCountdownConfetti, setShowCountdownConfetti] = useState(false);
  const [showGift, setShowGift] = useState(false);

  const handleOpen = useCallback(() => {
    setPhase("match");
  }, []);

  const handleMatchComplete = useCallback(() => {
    setPhase("content");
    playConfettiSound();
  }, []);

  return (
    <div>
      <Confetti show={phase === "content"} />
      <Confetti show={showCountdownConfetti} />
      <AnimatePresence mode="wait">
        {phase === "opening" && (
          <motion.div
            key="opening"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TinderOpeningScreen
              invitation={invitation}
              guestName={guestName}
              onOpen={handleOpen}
            />
          </motion.div>
        )}

        {phase === "match" && (
          <motion.div key="match">
            <MatchTransition onComplete={handleMatchComplete} />
          </motion.div>
        )}

        {phase === "content" && (
          <motion.main
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen"
            style={{ backgroundColor: COLORS.lightBg }}
          >
            <FallingPetals variant="hearts" />
            <ScrollDots sections={TINDER_SCROLL_SECTIONS} accentColor="#FD267A" />

            {/* ═══════════ HERO / KAMI YANG BERBAHAGIA ═══════════ */}
            {(invitation.heroPhoto || invitation.groomPhoto) && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mx-4 my-4 bg-white rounded-xl shadow-md p-6 text-center"
              >
                <div className="relative w-56 h-72 md:w-64 md:h-80 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-[40%_40%_4%_4%] bg-gradient-to-br from-[#FD267A] to-[#FF6036] p-[3px]">
                    <div className="w-full h-full rounded-[40%_40%_3%_3%] overflow-hidden">
                      <img src={invitation.heroPhoto || invitation.groomPhoto || ""} alt="Couple" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
                <p className="text-xs tracking-widest uppercase text-gray-400 mb-2">Kami Yang Berbahagia</p>
                <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "#1A1A2E" }}>
                  {invitation.heroNickname || `${invitation.groomName} & ${invitation.brideName}`}
                </h2>
              </motion.section>
            )}

            {/* ═══════════ QUOTE / AYAT ═══════════ */}
            {(invitation.quoteArabic || invitation.quoteText) && (
              <motion.section
                id="quote"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mx-4 my-4 bg-white rounded-xl shadow-md p-6 text-center"
              >
                {invitation.quoteArabic && (
                  <p dir="rtl" className="text-xl md:text-2xl text-gray-800 leading-loose mb-4 font-serif">
                    {invitation.quoteArabic}
                  </p>
                )}
                {invitation.quoteText && (
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed italic">
                    &ldquo;{invitation.quoteText}&rdquo;
                  </p>
                )}
                {invitation.quoteSource && (
                  <p className="mt-3 text-xs font-semibold" style={{ color: COLORS.primary }}>
                    — {invitation.quoteSource}
                  </p>
                )}
              </motion.section>
            )}

            {/* ═══════════ COUPLE PROFILES ═══════════ */}
            <motion.section
              id="couple"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-4 my-4 bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-xl font-bold text-center mb-6" style={{ color: COLORS.dark }}>
                Mempelai
              </h2>
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                {/* Groom */}
                <div className="text-center">
                  {invitation.groomPhoto ? (
                    <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-pink-100 shadow-lg">
                      <img src={invitation.groomPhoto} alt={invitation.groomName} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-28 h-28 mx-auto rounded-full flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${COLORS.primary}20, ${COLORS.secondary}20)` }}>
                      <span className="text-3xl">🤵</span>
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-gray-800 mt-3">
                    {invitation.groomFullName || invitation.groomName}
                  </h3>
                  {invitation.groomChildOrder && (
                    <p className="text-xs text-gray-500 mt-1">{invitation.groomChildOrder}</p>
                  )}
                  {(invitation.groomFather || invitation.groomMother) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {invitation.groomFather && `Bapak ${invitation.groomFather}`}
                      {invitation.groomFather && invitation.groomMother && " & "}
                      {invitation.groomMother && `Ibu ${invitation.groomMother}`}
                    </p>
                  )}
                </div>

                {/* Ampersand */}
                <div className="text-3xl font-bold" style={{ color: COLORS.primary }}>❤️</div>

                {/* Bride */}
                <div className="text-center">
                  {invitation.bridePhoto ? (
                    <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-pink-100 shadow-lg">
                      <img src={invitation.bridePhoto} alt={invitation.brideName} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-28 h-28 mx-auto rounded-full flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${COLORS.primary}20, ${COLORS.secondary}20)` }}>
                      <span className="text-3xl">👰</span>
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-gray-800 mt-3">
                    {invitation.brideFullName || invitation.brideName}
                  </h3>
                  {invitation.brideChildOrder && (
                    <p className="text-xs text-gray-500 mt-1">{invitation.brideChildOrder}</p>
                  )}
                  {(invitation.brideFather || invitation.brideMother) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {invitation.brideFather && `Bapak ${invitation.brideFather}`}
                      {invitation.brideFather && invitation.brideMother && " & "}
                      {invitation.brideMother && `Ibu ${invitation.brideMother}`}
                    </p>
                  )}
                </div>
              </div>
            </motion.section>

            {/* ═══════════ COUNTDOWN ═══════════ */}
            <motion.section
              id="countdown"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-4 my-4 bg-white rounded-xl shadow-md p-6 text-center"
            >
              <h2 className="text-xl font-bold mb-6" style={{ color: COLORS.dark }}>
                Menghitung Hari
              </h2>
              <TinderCountdown eventDate={invitation.akadDate || invitation.resepsiDate || invitation.eventDate} onReachZero={() => { setShowCountdownConfetti(true); playConfettiSound(); }} />
            </motion.section>

            {/* ═══════════ EVENTS ═══════════ */}
            {(invitation.akadDate || invitation.resepsiDate || invitation.eventDate) && (
              <motion.section
                id="events"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mx-4 my-4 space-y-4"
              >
                {/* Akad */}
                {invitation.akadDate && (
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${COLORS.primary}20, ${COLORS.secondary}20)` }}>
                        <span className="text-sm">💍</span>
                      </div>
                      <h3 className="text-lg font-bold" style={{ color: COLORS.dark }}>Akad Nikah</h3>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">{formatIndonesianDate(invitation.akadDate)}</p>
                    {invitation.akadTime && (
                      <p className="text-sm text-gray-500 mt-1">{formatEventTime(invitation.akadTime, invitation.akadTimeEnd)}</p>
                    )}
                    {invitation.akadLocationName && <p className="text-sm font-medium text-gray-700 mt-3">{invitation.akadLocationName}</p>}
                    {invitation.akadLocation && <p className="text-xs text-gray-500 mt-1">{invitation.akadLocation}</p>}
                    {invitation.akadMapsUrl && (
                      <a href={invitation.akadMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 px-4 py-2 text-xs text-white rounded-full" style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}>
                        📍 Buka Maps
                      </a>
                    )}
                    {isEventPast(invitation.akadDate) && (
                      <p className="text-xs text-gray-400 italic mt-2">Acara telah berlangsung</p>
                    )}
                  </div>
                )}

                {/* Resepsi */}
                {invitation.resepsiDate && (
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${COLORS.primary}20, ${COLORS.secondary}20)` }}>
                        <span className="text-sm">🎉</span>
                      </div>
                      <h3 className="text-lg font-bold" style={{ color: COLORS.dark }}>Resepsi</h3>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">{formatIndonesianDate(invitation.resepsiDate)}</p>
                    {invitation.resepsiTime && (
                      <p className="text-sm text-gray-500 mt-1">{formatEventTime(invitation.resepsiTime, invitation.resepsiTimeEnd)}</p>
                    )}
                    {invitation.resepsiLocationName && <p className="text-sm font-medium text-gray-700 mt-3">{invitation.resepsiLocationName}</p>}
                    {invitation.resepsiLocation && <p className="text-xs text-gray-500 mt-1">{invitation.resepsiLocation}</p>}
                    {invitation.resepsiMapsUrl && (
                      <a href={invitation.resepsiMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 px-4 py-2 text-xs text-white rounded-full" style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}>
                        📍 Buka Maps
                      </a>
                    )}
                    {isEventPast(invitation.resepsiDate) && (
                      <p className="text-xs text-gray-400 italic mt-2">Acara telah berlangsung</p>
                    )}
                  </div>
                )}

                {/* Fallback single event */}
                {!invitation.akadDate && !invitation.resepsiDate && (
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <p className="text-sm text-gray-700 font-medium">{formatIndonesianDate(invitation.eventDate)}</p>
                    {invitation.eventTime && <p className="text-sm text-gray-500 mt-1">{invitation.eventTime} WIB</p>}
                    {invitation.locationName && <p className="text-sm font-medium text-gray-700 mt-3">{invitation.locationName}</p>}
                    {invitation.location && <p className="text-xs text-gray-500 mt-1">{invitation.location}</p>}
                    {invitation.mapsUrl && (
                      <a href={invitation.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 px-4 py-2 text-xs text-white rounded-full" style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}>
                        📍 Buka Maps
                      </a>
                    )}
                  </div>
                )}

                {/* Save the Date */}
                <div className="text-center">
                  <button
                    onClick={() => {
                      const dateStr = invitation.resepsiDate || invitation.akadDate || invitation.eventDate;
                      const startTime = invitation.resepsiTime || invitation.akadTime || invitation.eventTime;
                      const endTime = invitation.resepsiTimeEnd || invitation.akadTimeEnd || null;
                      const venue = invitation.resepsiLocationName || invitation.akadLocationName || invitation.locationName;
                      const address = invitation.resepsiLocation || invitation.akadLocation || invitation.location;
                      handleSaveTheDate(invitation.groomName, invitation.brideName, dateStr, startTime, endTime, venue, address);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
                    style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Save the Date
                  </button>
                </div>
              </motion.section>
            )}

            {/* ═══════════ GALLERY ═══════════ */}
            {invitation.gallery.length > 0 && (
              <motion.section
                id="gallery"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mx-4 my-4 bg-white rounded-xl shadow-md p-6"
              >
                <h2 className="text-xl font-bold text-center mb-6" style={{ color: COLORS.dark }}>
                  Galeri
                </h2>
                <TinderGallery gallery={invitation.gallery} />
              </motion.section>
            )}

            {/* ═══════════ LOVE STORY ═══════════ */}
            {invitation.loveStories.length > 0 && (
              <motion.section
                id="story"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mx-4 my-4 bg-white rounded-xl shadow-md p-6"
              >
                <h2 className="text-xl font-bold text-center mb-6" style={{ color: COLORS.dark }}>
                  Our Love Story
                </h2>
                <TinderLoveStory stories={invitation.loveStories} />
              </motion.section>
            )}

            {/* ═══════════ COMMENTS ═══════════ */}
            <motion.section
              id="comments"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-4 my-4 bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-xl font-bold text-center mb-6" style={{ color: COLORS.dark }}>
                Ucapan &amp; Doa
              </h2>
              <TinderComments invitationId={invitation.id} comments={invitation.comments} />
            </motion.section>

            {/* ═══════════ GIFT ═══════════ */}
            {invitation.giftAccounts.length > 0 && (
              <motion.section
                id="gift"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mx-4 my-4 bg-white rounded-xl shadow-md p-6"
              >
                <h2 className="text-xl font-bold text-center mb-6" style={{ color: COLORS.dark }}>
                  Hadiah Pernikahan
                </h2>
                <p className="text-sm text-gray-500 text-center mb-4">
                  Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika Anda ingin memberikan tanda kasih, kami menyediakan informasi berikut:
                </p>
                <div className="text-center mb-4">
                  <button
                    onClick={() => setShowGift(!showGift)}
                    className="px-6 py-3 rounded-full text-white font-medium text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
                    style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
                  >
                    {showGift ? "Sembunyikan" : (<><svg className="inline w-4 h-4 mr-1 -mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>Kirim Hadiah</>)}
                  </button>
                </div>
                <AnimatePresence>
                  {showGift && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <TinderGift invitation={invitation} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>
            )}

            {/* ═══════════ FOOTER ═══════════ */}
            <motion.footer
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-4 my-4 mb-24 bg-white rounded-xl shadow-md p-8 text-center"
            >
              <p className="text-sm text-gray-500 mb-2">Terima Kasih</p>
              <p className="text-xl font-bold" style={{ color: COLORS.dark }}>
                {invitation.groomName} & {invitation.brideName}
              </p>
              {invitation.hashtag && (
                <p className="text-sm mt-2" style={{ color: COLORS.primary }}>
                  {invitation.hashtag}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-4">Made with ♥</p>
            </motion.footer>

            {/* Music Player */}
            {invitation.musicUrl && (
              <MusicPlayer musicUrl={invitation.musicUrl} accentColor={COLORS.primary} />
            )}
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
