"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SerializedInvitation, SerializedGallery } from "@/app/(public)/[slug]/InvitationClient";

interface FloralTemplateProps {
  invitation: SerializedInvitation;
  guestName?: string | null;
}

// Nav items config
const NAV_ITEMS = [
  { id: "home", label: "Home", icon: "🌸" },
  { id: "ayat", label: "Ayat", icon: "📖" },
  { id: "mempelai", label: "Mempelai", icon: "💐" },
  { id: "acara", label: "Acara", icon: "🌷" },
  { id: "story", label: "Love Story", icon: "🌹" },
  { id: "galeri", label: "Galeri", icon: "🌻" },
  { id: "hadiah", label: "Hadiah", icon: "🎁" },
  { id: "rsvp", label: "RSVP", icon: "💌" },
];

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function FloralTemplate({ invitation, guestName }: FloralTemplateProps) {
  const [isOpened, setIsOpened] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [commentName, setCommentName] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [commentAttendance, setCommentAttendance] = useState("hadir");
  const [comments, setComments] = useState(invitation.comments);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  // Audio setup
  useEffect(() => {
    if (invitation.musicUrl && isOpened) {
      const audio = new Audio(invitation.musicUrl);
      audio.volume = volume;
      audio.loop = true;
      audioRef.current = audio;

      audio.addEventListener("timeupdate", () => setCurrentTime(audio.currentTime));
      audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));

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

  // Volume control
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const seekTo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Scroll to section
  const scrollToSection = (id: string) => {
    const el = document.getElementById(`floral-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setActiveSection(id);
    setSidebarOpen(false);
  };

  // Intersection observer for active section
  useEffect(() => {
    if (!isOpened) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace("floral-", "");
            setActiveSection(id);
          }
        });
      },
      { threshold: 0.3 }
    );

    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(`floral-${id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isOpened]);

  // Submit comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentMessage.trim()) return;

    try {
      const res = await fetch(`/api/invitations/${invitation.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestName: commentName, message: commentMessage, attendance: commentAttendance }),
      });
      if (res.ok) {
        const json = await res.json();
        setComments((prev) => [json.data, ...prev]);
        setCommentName("");
        setCommentMessage("");
      }
    } catch (err) {
      console.error("Failed to submit comment", err);
    }
  };

  // Copy account number
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(id);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  // ═══════════ OPENING SCREEN ═══════════
  if (!isOpened) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf7f2] px-4 text-center relative overflow-hidden">
        {/* Decorative floral corners */}
        <div className="absolute top-4 left-4 text-4xl opacity-40 select-none">🌿</div>
        <div className="absolute top-4 right-4 text-4xl opacity-40 select-none">🌿</div>
        <div className="absolute bottom-4 left-4 text-4xl opacity-40 select-none">🌺</div>
        <div className="absolute bottom-4 right-4 text-4xl opacity-40 select-none">🌺</div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="max-w-sm mx-auto"
        >
          {/* Main card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="bg-[#2d3a2e] rounded-2xl border-4 border-[#8B3A62] p-8 shadow-2xl relative"
          >
            {/* Inner decorative border */}
            <div className="absolute inset-3 border border-[#d4a843]/30 rounded-xl pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-[#d4a843] text-2xl mb-3"
            >
              🌸
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-xs uppercase tracking-[0.3em] text-[#f5e6d3]/60 mb-5 font-serif"
            >
              Wedding Invitation
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.7 }}
              className="text-3xl md:text-4xl text-[#f5e6d3] mb-1"
              style={{ fontFamily: "var(--font-dancing), cursive" }}
            >
              {invitation.groomName}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="text-xl text-[#d4a843] mb-1"
            >
              &amp;
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.7 }}
              className="text-3xl md:text-4xl text-[#f5e6d3] mb-6"
              style={{ fontFamily: "var(--font-dancing), cursive" }}
            >
              {invitation.brideName}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.6 }}
              className="text-[#f5e6d3]/70 text-sm mb-2"
            >
              {new Date(invitation.eventDate).toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </motion.p>

            {invitation.hashtag && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.0, duration: 0.6 }}
                className="text-[#d4a843] text-xs mb-3"
              >
                {invitation.hashtag}
              </motion.p>
            )}

            {guestName && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.1, duration: 0.6 }}
                className="mb-6"
              >
                <p className="text-[10px] tracking-widest text-[#f5e6d3]/50 mb-1">Kepada Yth.</p>
                <p className="text-base font-medium text-[#f5e6d3]">{guestName}</p>
              </motion.div>
            )}

            {!guestName && <div className="mb-6" />}

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.3, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpened(true)}
              className="px-7 py-2.5 bg-[#8B3A62] text-[#f5e6d3] font-medium rounded-full hover:bg-[#a04472] transition-colors shadow-lg text-sm"
            >
              Buka Undangan
            </motion.button>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.6, duration: 0.6 }}
              className="mt-5 flex justify-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B3A62]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#f5e6d3]/30" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#f5e6d3]/30" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ═══════════ MAIN LAYOUT ═══════════
  return (
    <div className="flex h-screen bg-[#faf7f2] text-[#2d3a2e] overflow-hidden">
      {/* ═══ SIDEBAR (Desktop) ═══ */}
      <aside className="hidden lg:flex flex-col w-[220px] bg-[#faf7f2] border-r border-[#8B3A62]/20 p-4 overflow-y-auto shrink-0">
        {/* Logo / Initials */}
        <div className="mb-6 px-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#8B3A62] flex items-center justify-center text-xs font-bold text-[#f5e6d3]">
              🌸
            </div>
            <span className="font-bold text-sm tracking-wide text-[#8B3A62]" style={{ fontFamily: "var(--font-dancing), cursive" }}>
              {invitation.groomName.charAt(0)} & {invitation.brideName.charAt(0)}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeSection === item.id
                  ? "text-[#8B3A62] bg-[#8B3A62]/10 border-l-2 border-[#8B3A62]"
                  : "text-[#2d3a2e]/70 hover:text-[#8B3A62] hover:bg-[#8B3A62]/5"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Wedding Playlist */}
        <div className="mt-6 pt-4 border-t border-[#8B3A62]/20">
          <p className="text-[10px] uppercase tracking-widest text-[#8B3A62]/60 mb-3 px-2">Wedding Song</p>
          <div className="px-2">
            <p className="text-xs text-[#2d3a2e] truncate font-medium">
              {invitation.musicUrl ? "Wedding Song" : "No music"}
            </p>
            <p className="text-[10px] text-[#2d3a2e]/50 truncate">
              {invitation.groomName} & {invitation.brideName}
            </p>
          </div>
        </div>
      </aside>

      {/* ═══ MOBILE HAMBURGER ═══ */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-[#8B3A62] rounded-full flex items-center justify-center shadow-lg text-[#f5e6d3]"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/40 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[260px] bg-[#faf7f2] z-50 p-4 overflow-y-auto shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#8B3A62] flex items-center justify-center text-xs font-bold text-[#f5e6d3]">🌸</div>
                  <span className="font-bold text-sm text-[#8B3A62]" style={{ fontFamily: "var(--font-dancing), cursive" }}>
                    {invitation.groomName.charAt(0)} & {invitation.brideName.charAt(0)}
                  </span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-[#2d3a2e]/60 hover:text-[#8B3A62]">✕</button>
              </div>
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                      activeSection === item.id
                        ? "text-[#8B3A62] bg-[#8B3A62]/10 border-l-2 border-[#8B3A62]"
                        : "text-[#2d3a2e]/70 hover:text-[#8B3A62]"
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ═══ MAIN CONTENT ═══ */}
      <div ref={mainRef} className="flex-1 overflow-y-auto pb-24">

        {/* ── HERO SECTION ── */}
        <section id="floral-home" className="relative min-h-[70vh] flex items-end">
          {invitation.gallery.length > 0 ? (
            <img
              src={invitation.gallery[0].imageUrl}
              alt="Hero"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#2d3a2e] to-[#1a2a1c]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2d3a2e] via-[#2d3a2e]/60 to-transparent" />
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative z-10 p-6 md:p-12 w-full"
          >
            <p className="text-sm text-[#f5e6d3]/70 mb-2 uppercase tracking-widest">The Wedding of</p>
            <h1
              className="text-4xl md:text-6xl mb-3 text-[#f5e6d3]"
              style={{ fontFamily: "var(--font-dancing), cursive" }}
            >
              {invitation.groomName} <span className="text-[#d4a843]">&</span> {invitation.brideName}
            </h1>
            <p className="text-[#f5e6d3]/80 text-lg">
              {new Date(invitation.eventDate).toLocaleDateString("id-ID", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
              })}
            </p>
            {invitation.hashtag && (
              <p className="mt-3 text-[#d4a843] font-medium flex items-center gap-1">
                <span>🌸</span> {invitation.hashtag}
              </p>
            )}
          </motion.div>
        </section>

        {/* ── QUOTE / AYAT ── */}
        {(invitation.quoteText || invitation.quoteArabic) && (
          <section id="floral-ayat" className="py-16 px-6 md:px-12">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="bg-[#2d3a2e] rounded-2xl p-8 border-2 border-[#8B3A62]/40 relative">
                <div className="absolute inset-2 border border-[#d4a843]/20 rounded-xl pointer-events-none" />
                <span className="text-[#d4a843] text-2xl block mb-4">❝</span>
                {invitation.quoteArabic && (
                  <p dir="rtl" className="text-2xl md:text-3xl text-[#f5e6d3] leading-loose mb-6 font-serif">
                    {invitation.quoteArabic}
                  </p>
                )}
                {invitation.quoteText && (
                  <p className="text-lg md:text-xl text-[#f5e6d3]/90 leading-relaxed font-serif">
                    &ldquo;{invitation.quoteText}&rdquo;
                  </p>
                )}
                {invitation.quoteSource && (
                  <p className="mt-4 text-sm text-[#d4a843] font-medium">— {invitation.quoteSource}</p>
                )}
              </div>
            </motion.div>
          </section>
        )}

        {/* Anchor for ayat if empty */}
        {!invitation.quoteText && !invitation.quoteArabic && <div id="floral-ayat" />}

        {/* ── MEMPELAI ── */}
        <section id="floral-mempelai" className="py-16 px-6 md:px-12">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-2xl md:text-3xl font-bold mb-10 text-center text-[#8B3A62]"
              style={{ fontFamily: "var(--font-dancing), cursive" }}
            >
              Mempelai
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Groom */}
              <motion.div variants={fadeInUp} className="bg-[#2d3a2e] rounded-2xl p-6 text-center border-2 border-[#8B3A62]/30 hover:border-[#8B3A62]/60 transition-colors">
                {invitation.groomPhoto ? (
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-3 border-[#d4a843]/50">
                    <img src={invitation.groomPhoto} alt={invitation.groomName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-[#3a4a3a] flex items-center justify-center border-2 border-[#d4a843]/30">
                    <span className="text-3xl">🤵</span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-[#f5e6d3]" style={{ fontFamily: "var(--font-dancing), cursive" }}>
                  {invitation.groomFullName || invitation.groomName}
                </h3>
                {invitation.groomChildOrder && (
                  <p className="text-sm text-[#f5e6d3]/60 mt-1 italic">{invitation.groomChildOrder}</p>
                )}
                {(invitation.groomFather || invitation.groomMother) && (
                  <p className="text-sm text-[#f5e6d3]/60 mt-2">
                    {invitation.groomFather && `Bapak ${invitation.groomFather}`}
                    {invitation.groomFather && invitation.groomMother && " & "}
                    {invitation.groomMother && `Ibu ${invitation.groomMother}`}
                  </p>
                )}
              </motion.div>

              {/* Bride */}
              <motion.div variants={fadeInUp} className="bg-[#2d3a2e] rounded-2xl p-6 text-center border-2 border-[#8B3A62]/30 hover:border-[#8B3A62]/60 transition-colors">
                {invitation.bridePhoto ? (
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-3 border-[#d4a843]/50">
                    <img src={invitation.bridePhoto} alt={invitation.brideName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-[#3a4a3a] flex items-center justify-center border-2 border-[#d4a843]/30">
                    <span className="text-3xl">👰</span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-[#f5e6d3]" style={{ fontFamily: "var(--font-dancing), cursive" }}>
                  {invitation.brideFullName || invitation.brideName}
                </h3>
                {invitation.brideChildOrder && (
                  <p className="text-sm text-[#f5e6d3]/60 mt-1 italic">{invitation.brideChildOrder}</p>
                )}
                {(invitation.brideFather || invitation.brideMother) && (
                  <p className="text-sm text-[#f5e6d3]/60 mt-2">
                    {invitation.brideFather && `Bapak ${invitation.brideFather}`}
                    {invitation.brideFather && invitation.brideMother && " & "}
                    {invitation.brideMother && `Ibu ${invitation.brideMother}`}
                  </p>
                )}
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ── ACARA ── */}
        <section id="floral-acara" className="py-16 px-6 md:px-12 bg-[#2d3a2e]">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-2xl md:text-3xl font-bold mb-10 text-center text-[#f5e6d3]"
              style={{ fontFamily: "var(--font-dancing), cursive" }}
            >
              Acara Pernikahan
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(invitation.akadDate || invitation.akadTime) && (
                <motion.div variants={fadeInUp} className="bg-[#3a4a3a] rounded-2xl p-6 border border-[#8B3A62]/30">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-8 h-8 rounded-full bg-[#8B3A62]/20 flex items-center justify-center text-sm">💍</span>
                    <h3 className="text-lg font-bold text-[#f5e6d3]">Akad Nikah</h3>
                  </div>
                  {invitation.akadDate && (
                    <p className="text-[#f5e6d3]/80">
                      {new Date(invitation.akadDate).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  )}
                  {invitation.akadTime && <p className="text-[#f5e6d3]/60 text-sm mt-1">Pukul {invitation.akadTime}</p>}
                  {invitation.akadLocationName && <p className="text-[#f5e6d3] font-medium mt-3">{invitation.akadLocationName}</p>}
                  {invitation.akadLocation && <p className="text-[#f5e6d3]/60 text-sm mt-1">{invitation.akadLocation}</p>}
                  {invitation.akadMapsUrl && (
                    <a href={invitation.akadMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 px-4 py-2 text-sm bg-[#8B3A62] text-[#f5e6d3] font-medium rounded-full hover:bg-[#a04472] transition-colors">
                      📍 Buka Maps
                    </a>
                  )}
                </motion.div>
              )}

              {(invitation.resepsiDate || invitation.resepsiTime) && (
                <motion.div variants={fadeInUp} className="bg-[#3a4a3a] rounded-2xl p-6 border border-[#8B3A62]/30">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-8 h-8 rounded-full bg-[#d4a843]/20 flex items-center justify-center text-sm">🎉</span>
                    <h3 className="text-lg font-bold text-[#f5e6d3]">Resepsi</h3>
                  </div>
                  {invitation.resepsiDate && (
                    <p className="text-[#f5e6d3]/80">
                      {new Date(invitation.resepsiDate).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  )}
                  {invitation.resepsiTime && <p className="text-[#f5e6d3]/60 text-sm mt-1">Pukul {invitation.resepsiTime}</p>}
                  {invitation.resepsiLocationName && <p className="text-[#f5e6d3] font-medium mt-3">{invitation.resepsiLocationName}</p>}
                  {invitation.resepsiLocation && <p className="text-[#f5e6d3]/60 text-sm mt-1">{invitation.resepsiLocation}</p>}
                  {invitation.resepsiMapsUrl && (
                    <a href={invitation.resepsiMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 px-4 py-2 text-sm bg-[#8B3A62] text-[#f5e6d3] font-medium rounded-full hover:bg-[#a04472] transition-colors">
                      📍 Buka Maps
                    </a>
                  )}
                </motion.div>
              )}
            </div>

            {/* Fallback single event */}
            {!invitation.akadDate && !invitation.resepsiDate && (
              <motion.div variants={fadeInUp} className="bg-[#3a4a3a] rounded-2xl p-6 border border-[#8B3A62]/30 max-w-md mx-auto text-center">
                <p className="text-[#f5e6d3]/80">
                  {new Date(invitation.eventDate).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
                {invitation.eventTime && <p className="text-[#f5e6d3]/60 text-sm mt-1">Pukul {invitation.eventTime}</p>}
                {invitation.locationName && <p className="text-[#f5e6d3] font-medium mt-3">{invitation.locationName}</p>}
                {invitation.location && <p className="text-[#f5e6d3]/60 text-sm mt-1">{invitation.location}</p>}
                {invitation.mapsUrl && (
                  <a href={invitation.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 px-4 py-2 text-sm bg-[#8B3A62] text-[#f5e6d3] font-medium rounded-full hover:bg-[#a04472] transition-colors">
                    📍 Buka Maps
                  </a>
                )}
              </motion.div>
            )}
          </motion.div>
        </section>

        {/* ── OUR STORY / TIMELINE ── */}
        {invitation.loveStories.length > 0 && (
          <section id="floral-story" className="py-16 px-6 md:px-12">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="max-w-2xl mx-auto"
            >
              <motion.h2
                variants={fadeInUp}
                className="text-2xl md:text-3xl font-bold mb-10 text-center text-[#8B3A62]"
                style={{ fontFamily: "var(--font-dancing), cursive" }}
              >
                Our Love Story
              </motion.h2>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#8B3A62]/30" />
                {invitation.loveStories.map((story) => (
                  <motion.div key={story.id} variants={fadeInUp} className="relative pl-12 mb-8">
                    <div className="absolute left-2.5 top-2 w-4 h-4 rounded-full bg-[#8B3A62] border-2 border-[#faf7f2]" />
                    <div className="bg-[#2d3a2e] rounded-xl p-5 border border-[#8B3A62]/30 hover:border-[#8B3A62]/60 transition-colors">
                      {story.date && <p className="text-xs text-[#d4a843] font-medium mb-1">{story.date}</p>}
                      <h4 className="font-bold text-[#f5e6d3]">{story.title}</h4>
                      <p className="text-sm text-[#f5e6d3]/70 mt-2 leading-relaxed">{story.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* Anchor for story if empty */}
        {invitation.loveStories.length === 0 && <div id="floral-story" />}

        {/* ── GALERI ── */}
        <section id="floral-galeri" className="py-16 px-6 md:px-12 bg-[#2d3a2e]">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-2xl md:text-3xl font-bold mb-10 text-center text-[#f5e6d3]"
              style={{ fontFamily: "var(--font-dancing), cursive" }}
            >
              Galeri
            </motion.h2>
            {invitation.gallery.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {invitation.gallery.map((photo, i) => (
                  <motion.div
                    key={photo.id}
                    variants={fadeInUp}
                    className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative border border-[#8B3A62]/20"
                    onClick={() => setLightboxImage(photo.imageUrl)}
                  >
                    <img
                      src={photo.imageUrl}
                      alt={`Foto ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-[#8B3A62]/20 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-2xl">🌸</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[#f5e6d3]/50">Belum ada foto</p>
            )}
          </motion.div>
        </section>

        {/* Lightbox */}
        <AnimatePresence>
          {lightboxImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4"
              onClick={() => setLightboxImage(null)}
            >
              <motion.img
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                src={lightboxImage}
                alt="Preview"
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-[#8B3A62]/80 backdrop-blur rounded-full flex items-center justify-center text-white text-xl hover:bg-[#8B3A62]"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── HADIAH / GIFT ── */}
        <section id="floral-hadiah" className="py-16 px-6 md:px-12">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-2xl md:text-3xl font-bold mb-4 text-center text-[#8B3A62]"
              style={{ fontFamily: "var(--font-dancing), cursive" }}
            >
              Hadiah
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-[#2d3a2e]/70 text-center mb-8 text-sm">
              Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika Anda ingin memberikan tanda kasih, kami menyediakan informasi berikut.
            </motion.p>
            {invitation.giftAccounts.length > 0 ? (
              <div className="space-y-4">
                {invitation.giftAccounts.map((account) => (
                  <motion.div
                    key={account.id}
                    variants={fadeInUp}
                    className="bg-[#2d3a2e] rounded-xl p-5 border border-[#8B3A62]/30 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs text-[#d4a843] font-medium uppercase tracking-wide">{account.bankName}</p>
                      <p className="text-[#f5e6d3] font-mono text-lg mt-1">{account.accountNumber}</p>
                      <p className="text-[#f5e6d3]/60 text-sm mt-0.5">a.n. {account.accountHolder}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(account.accountNumber, account.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        copiedAccount === account.id
                          ? "bg-[#d4a843] text-[#2d3a2e]"
                          : "bg-[#8B3A62] text-[#f5e6d3] hover:bg-[#a04472]"
                      }`}
                    >
                      {copiedAccount === account.id ? "✓ Copied" : "Copy"}
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[#2d3a2e]/50">Belum ada informasi hadiah</p>
            )}
          </motion.div>
        </section>

        {/* ── RSVP / COMMENTS ── */}
        <section id="floral-rsvp" className="py-16 px-6 md:px-12 bg-[#2d3a2e]">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-2xl md:text-3xl font-bold mb-8 text-center text-[#f5e6d3]"
              style={{ fontFamily: "var(--font-dancing), cursive" }}
            >
              RSVP & Ucapan
            </motion.h2>

            {/* Form */}
            <motion.form
              variants={fadeInUp}
              onSubmit={handleSubmitComment}
              className="bg-[#3a4a3a] rounded-xl p-6 border border-[#8B3A62]/30 mb-8"
            >
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-[#f5e6d3]/70 block mb-1">Nama</label>
                  <input
                    type="text"
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    className="w-full bg-[#2d3a2e] border border-[#8B3A62]/30 rounded-lg px-4 py-2.5 text-[#f5e6d3] placeholder-[#f5e6d3]/30 focus:outline-none focus:border-[#8B3A62] transition-colors"
                    placeholder="Nama Anda"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-[#f5e6d3]/70 block mb-1">Kehadiran</label>
                  <select
                    value={commentAttendance}
                    onChange={(e) => setCommentAttendance(e.target.value)}
                    className="w-full bg-[#2d3a2e] border border-[#8B3A62]/30 rounded-lg px-4 py-2.5 text-[#f5e6d3] focus:outline-none focus:border-[#8B3A62] transition-colors"
                  >
                    <option value="hadir">Hadir</option>
                    <option value="tidak_hadir">Tidak Hadir</option>
                    <option value="ragu">Masih Ragu</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-[#f5e6d3]/70 block mb-1">Ucapan</label>
                  <textarea
                    value={commentMessage}
                    onChange={(e) => setCommentMessage(e.target.value)}
                    rows={3}
                    className="w-full bg-[#2d3a2e] border border-[#8B3A62]/30 rounded-lg px-4 py-2.5 text-[#f5e6d3] placeholder-[#f5e6d3]/30 focus:outline-none focus:border-[#8B3A62] transition-colors resize-none"
                    placeholder="Tulis ucapan untuk mempelai..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#8B3A62] text-[#f5e6d3] font-bold rounded-full hover:bg-[#a04472] transition-colors"
                >
                  Kirim Ucapan
                </button>
              </div>
            </motion.form>

            {/* Comments list */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin">
              {comments.length > 0 ? (
                comments.map((comment, idx) => (
                  <div
                    key={comment.id || `comment-${idx}`}
                    className="bg-[#3a4a3a] rounded-xl p-4 border border-[#8B3A62]/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-[#f5e6d3] text-sm">{comment.guestName || "Anonim"}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        comment.attendance === "hadir"
                          ? "bg-[#8B3A62]/20 text-[#d4a843]"
                          : comment.attendance === "tidak_hadir"
                          ? "bg-red-500/20 text-red-300"
                          : "bg-yellow-500/20 text-yellow-300"
                      }`}>
                        {comment.attendance === "tidak_hadir" ? "Tidak Hadir" : comment.attendance === "ragu" ? "Ragu" : "Hadir"}
                      </span>
                    </div>
                    <p className="text-[#f5e6d3]/70 text-sm">{comment.message}</p>
                    {comment.createdAt && (
                      <p className="text-[#f5e6d3]/40 text-xs mt-2">
                        {new Date(comment.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-[#f5e6d3]/50 py-8">Belum ada ucapan. Jadilah yang pertama!</p>
              )}
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 text-center bg-[#faf7f2]">
          <p className="text-[#2d3a2e]/60 text-sm mb-2">Terima kasih atas doa & kehadiran Anda</p>
          <p
            className="text-2xl text-[#8B3A62]"
            style={{ fontFamily: "var(--font-dancing), cursive" }}
          >
            {invitation.groomName} <span className="text-[#d4a843]">&</span> {invitation.brideName}
          </p>
          {invitation.hashtag && (
            <p className="text-sm text-[#8B3A62]/70 mt-2">{invitation.hashtag}</p>
          )}
          <p className="text-xs text-[#2d3a2e]/40 mt-6">Made with 🌸</p>
        </footer>
      </div>

      {/* ═══ MUSIC PLAYER BAR (Fixed Bottom) ═══ */}
      {invitation.musicUrl && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#2d3a2e] border-t border-[#8B3A62]/30 px-4 py-2">
          <div className="flex items-center justify-between max-w-screen-2xl mx-auto gap-4">
            {/* Left: Song info */}
            <div className="flex items-center gap-3 min-w-0 w-1/4">
              <div className="w-10 h-10 rounded bg-[#3a4a3a] flex items-center justify-center shrink-0 border border-[#8B3A62]/20">
                <span className="text-[#d4a843] text-sm">🌸</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-[#f5e6d3] truncate font-medium">Wedding Song</p>
                <p className="text-xs text-[#f5e6d3]/50 truncate">{invitation.groomName} & {invitation.brideName}</p>
              </div>
            </div>

            {/* Center: Controls + Progress */}
            <div className="flex flex-col items-center flex-1 max-w-[600px]">
              <div className="flex items-center gap-4 mb-1">
                <button
                  onClick={togglePlay}
                  className="w-8 h-8 rounded-full bg-[#8B3A62] flex items-center justify-center hover:scale-105 transition-transform"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <svg className="w-4 h-4 text-[#f5e6d3]" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-[#f5e6d3] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2 w-full">
                <span className="text-[10px] text-[#f5e6d3]/50 w-8 text-right">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={seekTo}
                  className="flex-1 h-1 accent-[#8B3A62] bg-[#f5e6d3]/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#f5e6d3]"
                />
                <span className="text-[10px] text-[#f5e6d3]/50 w-8">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right: Volume (hidden on mobile) */}
            <div className="hidden md:flex items-center gap-2 w-1/4 justify-end">
              <svg className="w-4 h-4 text-[#f5e6d3]/60" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24 h-1 accent-[#8B3A62] bg-[#f5e6d3]/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#f5e6d3]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

