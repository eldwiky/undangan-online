"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SerializedInvitation } from "@/app/(public)/[slug]/InvitationClient";

interface GalaxyTemplateProps {
  invitation: SerializedInvitation;
  guestName?: string | null;
}

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: "\u2728" },
  { id: "ayat", label: "Ayat", icon: "\uD83D\uDCD6" },
  { id: "mempelai", label: "Mempelai", icon: "\uD83D\uDCAB" },
  { id: "acara", label: "Acara", icon: "\uD83C\uDF19" },
  { id: "story", label: "Love Story", icon: "\u2B50" },
  { id: "galeri", label: "Galeri", icon: "\uD83C\uDF0C" },
  { id: "hadiah", label: "Hadiah", icon: "\uD83C\uDF81" },
  { id: "rsvp", label: "RSVP", icon: "\uD83D\uDC8C" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

function StarField({ count = 80 }: { count?: number }) {
  const stars = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 2.5 + 0.5,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

function FloatingParticles({ count = 20 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 8,
    duration: Math.random() * 6 + 8,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full animate-float-particle"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `radial-gradient(circle, rgba(201, 169, 110, 0.8), rgba(232, 213, 163, 0.3))`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

function ConstellationDecor({ className = "" }: { className?: string }) {
  return (
    <svg className={`absolute pointer-events-none opacity-20 ${className}`} width="200" height="200" viewBox="0 0 200 200">
      <circle cx="30" cy="40" r="2" fill="#c9a96e" />
      <circle cx="80" cy="20" r="1.5" fill="#c9a96e" />
      <circle cx="120" cy="60" r="2" fill="#c9a96e" />
      <circle cx="160" cy="30" r="1.5" fill="#c9a96e" />
      <circle cx="50" cy="100" r="2" fill="#c9a96e" />
      <circle cx="140" cy="120" r="1.5" fill="#c9a96e" />
      <circle cx="100" cy="160" r="2" fill="#c9a96e" />
      <circle cx="170" cy="150" r="1.5" fill="#c9a96e" />
      <line x1="30" y1="40" x2="80" y2="20" stroke="#c9a96e" strokeWidth="0.5" opacity="0.6" />
      <line x1="80" y1="20" x2="120" y2="60" stroke="#c9a96e" strokeWidth="0.5" opacity="0.6" />
      <line x1="120" y1="60" x2="160" y2="30" stroke="#c9a96e" strokeWidth="0.5" opacity="0.6" />
      <line x1="50" y1="100" x2="120" y2="60" stroke="#c9a96e" strokeWidth="0.5" opacity="0.6" />
      <line x1="140" y1="120" x2="120" y2="60" stroke="#c9a96e" strokeWidth="0.5" opacity="0.6" />
      <line x1="100" y1="160" x2="140" y2="120" stroke="#c9a96e" strokeWidth="0.5" opacity="0.6" />
      <line x1="170" y1="150" x2="140" y2="120" stroke="#c9a96e" strokeWidth="0.5" opacity="0.6" />
    </svg>
  );
}

function GalaxyDivider() {
  return (
    <div className="flex items-center justify-center py-8 px-6">
      <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c9a96e]/40" />
      <div className="mx-4 flex gap-1.5">
        <span className="w-1 h-1 rounded-full bg-[#c9a96e]/60 animate-twinkle" style={{ animationDelay: "0s" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] animate-twinkle" style={{ animationDelay: "0.5s" }} />
        <span className="w-1 h-1 rounded-full bg-[#c9a96e]/60 animate-twinkle" style={{ animationDelay: "1s" }} />
      </div>
      <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c9a96e]/40" />
    </div>
  );
}

export default function GalaxyTemplate({ invitation, guestName }: GalaxyTemplateProps) {
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

  useEffect(() => {
    if (invitation.musicUrl && isOpened) {
      const audio = new Audio(invitation.musicUrl);
      audio.volume = volume;
      audio.loop = true;
      audioRef.current = audio;
      audio.addEventListener("timeupdate", () => setCurrentTime(audio.currentTime));
      audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      return () => { audio.pause(); audio.src = ""; };
    }
  }, [invitation.musicUrl, isOpened]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const seekTo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) { audioRef.current.currentTime = time; setCurrentTime(time); }
  };

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(`galaxy-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setActiveSection(id);
    setSidebarOpen(false);
  };

  useEffect(() => {
    if (!isOpened) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace("galaxy-", "");
            setActiveSection(id);
          }
        });
      },
      { threshold: 0.3 }
    );
    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(`galaxy-${id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [isOpened]);

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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(id);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  // OPENING SCREEN
  if (!isOpened) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 text-center"
        style={{ background: "linear-gradient(135deg, #0a0e1a 0%, #1a1040 50%, #0a0e1a 100%)" }}>
        <StarField count={120} />
        <FloatingParticles count={15} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 animate-nebula"
            style={{ background: "radial-gradient(circle, rgba(107, 33, 168, 0.4), transparent 70%)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 animate-nebula"
            style={{ background: "radial-gradient(circle, rgba(59, 130, 246, 0.3), transparent 70%)", animationDelay: "5s" }} />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full opacity-10 animate-nebula"
            style={{ background: "radial-gradient(circle, rgba(236, 72, 153, 0.3), transparent 70%)", animationDelay: "10s" }} />
        </div>
        <ConstellationDecor className="top-10 left-10 w-40 h-40" />
        <ConstellationDecor className="bottom-10 right-10 w-48 h-48 rotate-180" />

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="relative z-10 max-w-md mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.8, type: "spring" }} className="text-[#c9a96e] text-3xl mb-6">
            &#10022;
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }} className="text-xs uppercase tracking-[0.4em] text-[#e8d5a3]/70 mb-8 font-serif">
            The Stars Aligned For Us
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0, duration: 0.8 }}
            className="text-4xl md:text-5xl font-serif text-[#f8f4e8] mb-3" style={{ textShadow: "0 0 30px rgba(201, 169, 110, 0.3)" }}>
            {invitation.groomName}
          </motion.h1>
          <motion.p initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.3, duration: 0.5 }} className="text-2xl text-[#c9a96e] mb-3 font-serif">
            &amp;
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6, duration: 0.8 }}
            className="text-4xl md:text-5xl font-serif text-[#f8f4e8] mb-8" style={{ textShadow: "0 0 30px rgba(201, 169, 110, 0.3)" }}>
            {invitation.brideName}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0, duration: 0.6 }} className="text-[#e8d5a3]/60 text-sm mb-2">
            {new Date(invitation.eventDate).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </motion.p>
          {invitation.hashtag && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 0.6 }} className="text-[#c9a96e] text-sm mb-4 font-serif">
              {invitation.hashtag}
            </motion.p>
          )}
          {guestName && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.3, duration: 0.6 }} className="mb-8">
              <p className="text-[10px] tracking-[0.3em] text-[#e8d5a3]/40 uppercase mb-1">Kepada Yth.</p>
              <p className="text-lg font-serif text-[#f8f4e8]">{guestName}</p>
            </motion.div>
          )}
          {!guestName && <div className="mb-8" />}
          <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.5, duration: 0.5 }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(201, 169, 110, 0.4)" }} whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpened(true)}
            className="px-8 py-3 border-2 border-[#c9a96e] text-[#e8d5a3] font-serif rounded-full hover:bg-[#c9a96e]/10 transition-all"
            style={{ boxShadow: "0 0 20px rgba(201, 169, 110, 0.2)" }}>
            Buka Undangan
          </motion.button>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.8, duration: 0.6 }} className="mt-10 flex justify-center gap-2">
            <span className="w-1 h-1 rounded-full bg-[#c9a96e] animate-twinkle" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] animate-twinkle" style={{ animationDelay: "1s" }} />
            <span className="w-1 h-1 rounded-full bg-[#c9a96e] animate-twinkle" style={{ animationDelay: "2s" }} />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // MAIN TEMPLATE LAYOUT
  return (
    <div className="flex h-screen text-[#f8f4e8] overflow-hidden" style={{ background: "#0a0e1a" }}>
      {/* SIDEBAR Desktop */}
      <aside className="hidden lg:flex flex-col w-[220px] shrink-0 p-4 overflow-y-auto border-r border-[#c9a96e]/10"
        style={{ background: "linear-gradient(180deg, #0a0e1a 0%, #0f1629 100%)" }}>
        <div className="mb-6 px-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9a96e] to-[#e8d5a3] flex items-center justify-center text-xs font-bold text-[#0a0e1a]">&#10022;</div>
            <span className="font-serif text-sm text-[#e8d5a3]">{invitation.groomName.charAt(0)} & {invitation.brideName.charAt(0)}</span>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} onClick={() => scrollToSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeSection === item.id ? "text-[#e8d5a3] bg-[#c9a96e]/10 border border-[#c9a96e]/30" : "text-[#f8f4e8]/50 hover:text-[#e8d5a3] hover:bg-[#c9a96e]/5"
              }`}>
              <span className="text-base">{item.icon}</span>
              <span className="font-serif">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-6 pt-4 border-t border-[#c9a96e]/10">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e]/50 mb-3 px-2">Now Playing</p>
          <div className="px-2">
            <p className="text-xs text-[#e8d5a3] truncate font-serif">{invitation.musicUrl ? "Wedding Song" : "No music"}</p>
            <p className="text-[10px] text-[#f8f4e8]/30 truncate">{invitation.groomName} & {invitation.brideName}</p>
          </div>
        </div>
      </aside>

      {/* MOBILE HAMBURGER */}
      <button onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-[#0f1629]/90 backdrop-blur border border-[#c9a96e]/20 rounded-full flex items-center justify-center shadow-lg"
        aria-label="Open menu">
        <svg className="w-5 h-5 text-[#c9a96e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[260px] z-50 p-4 overflow-y-auto border-r border-[#c9a96e]/10"
              style={{ background: "linear-gradient(180deg, #0a0e1a 0%, #0f1629 100%)" }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9a96e] to-[#e8d5a3] flex items-center justify-center text-xs font-bold text-[#0a0e1a]">&#10022;</div>
                  <span className="font-serif text-sm text-[#e8d5a3]">{invitation.groomName.charAt(0)} & {invitation.brideName.charAt(0)}</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-[#c9a96e]/60 hover:text-[#c9a96e]">&#10005;</button>
              </div>
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <button key={item.id} onClick={() => scrollToSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      activeSection === item.id ? "text-[#e8d5a3] bg-[#c9a96e]/10 border border-[#c9a96e]/30" : "text-[#f8f4e8]/50 hover:text-[#e8d5a3]"
                    }`}>
                    <span className="text-base">{item.icon}</span>
                    <span className="font-serif">{item.label}</span>
                  </button>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <div ref={mainRef} className="flex-1 overflow-y-auto pb-24 relative">
        <div className="fixed inset-0 pointer-events-none z-0"><StarField count={40} /></div>

        {/* HERO */}
        <section id="galaxy-home" className="relative min-h-[70vh] flex items-end">
          {invitation.gallery.length > 0 ? (
            <img src={invitation.gallery[0].imageUrl} alt="Hero" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0a0e1a, #1a1040, #0f1629)" }} />
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0a0e1a 0%, rgba(10,14,26,0.7) 40%, rgba(26,16,64,0.3) 100%)" }} />
          <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(ellipse at 70% 20%, rgba(107,33,168,0.3), transparent 60%)" }} />
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative z-10 p-6 md:p-12 w-full">
            <p className="text-xs text-[#c9a96e] mb-2 uppercase tracking-[0.3em] font-serif">The Wedding of</p>
            <h1 className="text-4xl md:text-6xl font-serif mb-3" style={{ textShadow: "0 0 40px rgba(201,169,110,0.3)" }}>
              {invitation.groomName} <span className="text-[#c9a96e]">&</span> {invitation.brideName}
            </h1>
            <p className="text-[#f8f4e8]/70 text-lg">
              {new Date(invitation.eventDate).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
            {invitation.hashtag && (
              <p className="mt-3 text-[#c9a96e] font-serif flex items-center gap-1"><span>&#10022;</span> {invitation.hashtag}</p>
            )}
          </motion.div>
        </section>

        {/* AYAT */}
        {(invitation.quoteText || invitation.quoteArabic) && (
          <section id="galaxy-ayat" className="py-16 px-6 md:px-12">
            <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-2xl mx-auto text-center">
              <div className="relative bg-[#0f1629]/80 backdrop-blur-sm rounded-2xl p-8 border border-[#c9a96e]/20" style={{ boxShadow: "0 0 40px rgba(107,33,168,0.1)" }}>
                <ConstellationDecor className="top-0 right-0 w-24 h-24 opacity-10" />
                {invitation.quoteArabic && (
                  <p dir="rtl" className="text-2xl md:text-3xl text-[#f8f4e8] leading-loose mb-6 font-serif">{invitation.quoteArabic}</p>
                )}
                {invitation.quoteText && (
                  <p className="text-lg md:text-xl text-[#f8f4e8]/80 leading-relaxed font-serif">&ldquo;{invitation.quoteText}&rdquo;</p>
                )}
                {invitation.quoteSource && (
                  <p className="mt-4 text-sm text-[#c9a96e] font-serif">&mdash; {invitation.quoteSource}</p>
                )}
              </div>
            </motion.div>
          </section>
        )}
        {!invitation.quoteText && !invitation.quoteArabic && <div id="galaxy-ayat" />}

        <GalaxyDivider />

        {/* MEMPELAI */}
        <section id="galaxy-mempelai" className="py-16 px-6 md:px-12">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-4xl mx-auto">
            <motion.h2 variants={fadeInUp} className="text-2xl md:text-3xl font-serif text-[#e8d5a3] mb-10 text-center">Mempelai</motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={fadeInUp} className="bg-[#0f1629]/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-[#c9a96e]/20 hover:border-[#c9a96e]/40 transition-colors">
                {invitation.groomPhoto ? (
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-2 border-[#c9a96e]/50 shadow-[0_0_20px_rgba(201,169,110,0.2)]">
                    <img src={invitation.groomPhoto} alt={invitation.groomName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#1a1040] to-[#0f1629] flex items-center justify-center border border-[#c9a96e]/30">
                    <span className="text-3xl">&#129333;</span>
                  </div>
                )}
                <h3 className="text-xl font-serif text-[#e8d5a3]">{invitation.groomFullName || invitation.groomName}</h3>
                {invitation.groomChildOrder && <p className="text-sm text-[#f8f4e8]/50 mt-1 italic">{invitation.groomChildOrder}</p>}
                {(invitation.groomFather || invitation.groomMother) && (
                  <p className="text-sm text-[#f8f4e8]/40 mt-2">
                    {invitation.groomFather && `Bapak ${invitation.groomFather}`}
                    {invitation.groomFather && invitation.groomMother && " & "}
                    {invitation.groomMother && `Ibu ${invitation.groomMother}`}
                  </p>
                )}
              </motion.div>
              <motion.div variants={fadeInUp} className="bg-[#0f1629]/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-[#c9a96e]/20 hover:border-[#c9a96e]/40 transition-colors">
                {invitation.bridePhoto ? (
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-2 border-[#c9a96e]/50 shadow-[0_0_20px_rgba(201,169,110,0.2)]">
                    <img src={invitation.bridePhoto} alt={invitation.brideName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#1a1040] to-[#0f1629] flex items-center justify-center border border-[#c9a96e]/30">
                    <span className="text-3xl">&#128112;</span>
                  </div>
                )}
                <h3 className="text-xl font-serif text-[#e8d5a3]">{invitation.brideFullName || invitation.brideName}</h3>
                {invitation.brideChildOrder && <p className="text-sm text-[#f8f4e8]/50 mt-1 italic">{invitation.brideChildOrder}</p>}
                {(invitation.brideFather || invitation.brideMother) && (
                  <p className="text-sm text-[#f8f4e8]/40 mt-2">
                    {invitation.brideFather && `Bapak ${invitation.brideFather}`}
                    {invitation.brideFather && invitation.brideMother && " & "}
                    {invitation.brideMother && `Ibu ${invitation.brideMother}`}
                  </p>
                )}
              </motion.div>
            </div>
          </motion.div>
        </section>

        <GalaxyDivider />

        {/* ACARA */}
        <section id="galaxy-acara" className="py-16 px-6 md:px-12">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-4xl mx-auto">
            <motion.h2 variants={fadeInUp} className="text-2xl md:text-3xl font-serif text-[#e8d5a3] mb-10 text-center">Acara Pernikahan</motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(invitation.akadDate || invitation.akadTime) && (
                <motion.div variants={fadeInUp} className="bg-[#0f1629]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#c9a96e]/20">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-8 h-8 rounded-full bg-[#c9a96e]/10 flex items-center justify-center text-sm border border-[#c9a96e]/30">&#128141;</span>
                    <h3 className="text-lg font-serif text-[#e8d5a3]">Akad Nikah</h3>
                  </div>
                  {invitation.akadDate && (
                    <p className="text-[#f8f4e8]/70">{new Date(invitation.akadDate).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                  )}
                  {invitation.akadTime && <p className="text-[#f8f4e8]/50 text-sm mt-1">Pukul {invitation.akadTime}</p>}
                  {invitation.akadLocationName && <p className="text-[#e8d5a3] font-medium mt-3">{invitation.akadLocationName}</p>}
                  {invitation.akadLocation && <p className="text-[#f8f4e8]/40 text-sm mt-1">{invitation.akadLocation}</p>}
                  {invitation.akadMapsUrl && (
                    <a href={invitation.akadMapsUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-block mt-4 px-4 py-2 text-sm border border-[#c9a96e] text-[#c9a96e] font-serif rounded-full hover:bg-[#c9a96e]/10 transition-colors">
                      &#128205; Buka Maps
                    </a>
                  )}
                </motion.div>
              )}
              {(invitation.resepsiDate || invitation.resepsiTime) && (
                <motion.div variants={fadeInUp} className="bg-[#0f1629]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#c9a96e]/20">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-8 h-8 rounded-full bg-[#c9a96e]/10 flex items-center justify-center text-sm border border-[#c9a96e]/30">&#127881;</span>
                    <h3 className="text-lg font-serif text-[#e8d5a3]">Resepsi</h3>
                  </div>
                  {invitation.resepsiDate && (
                    <p className="text-[#f8f4e8]/70">{new Date(invitation.resepsiDate).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                  )}
                  {invitation.resepsiTime && <p className="text-[#f8f4e8]/50 text-sm mt-1">Pukul {invitation.resepsiTime}</p>}
                  {invitation.resepsiLocationName && <p className="text-[#e8d5a3] font-medium mt-3">{invitation.resepsiLocationName}</p>}
                  {invitation.resepsiLocation && <p className="text-[#f8f4e8]/40 text-sm mt-1">{invitation.resepsiLocation}</p>}
                  {invitation.resepsiMapsUrl && (
                    <a href={invitation.resepsiMapsUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-block mt-4 px-4 py-2 text-sm border border-[#c9a96e] text-[#c9a96e] font-serif rounded-full hover:bg-[#c9a96e]/10 transition-colors">
                      &#128205; Buka Maps
                    </a>
                  )}
                </motion.div>
              )}
            </div>
            {!invitation.akadDate && !invitation.resepsiDate && (
              <motion.div variants={fadeInUp} className="bg-[#0f1629]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#c9a96e]/20 max-w-md mx-auto text-center">
                <p className="text-[#f8f4e8]/70">{new Date(invitation.eventDate).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                {invitation.eventTime && <p className="text-[#f8f4e8]/50 text-sm mt-1">Pukul {invitation.eventTime}</p>}
                {invitation.locationName && <p className="text-[#e8d5a3] font-medium mt-3">{invitation.locationName}</p>}
                {invitation.location && <p className="text-[#f8f4e8]/40 text-sm mt-1">{invitation.location}</p>}
                {invitation.mapsUrl && (
                  <a href={invitation.mapsUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-block mt-4 px-4 py-2 text-sm border border-[#c9a96e] text-[#c9a96e] font-serif rounded-full hover:bg-[#c9a96e]/10 transition-colors">
                    &#128205; Buka Maps
                  </a>
                )}
              </motion.div>
            )}
          </motion.div>
        </section>

        <GalaxyDivider />

        {/* LOVE STORY */}
        {invitation.loveStories.length > 0 && (
          <section id="galaxy-story" className="py-16 px-6 md:px-12">
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-2xl mx-auto">
              <motion.h2 variants={fadeInUp} className="text-2xl md:text-3xl font-serif text-[#e8d5a3] mb-10 text-center">Our Love Story</motion.h2>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-[#c9a96e]/50 via-[#6b21a8]/30 to-[#c9a96e]/50" />
                {invitation.loveStories.map((story) => (
                  <motion.div key={story.id} variants={fadeInUp} className="relative pl-12 mb-8">
                    <div className="absolute left-2.5 top-2 w-4 h-4 rounded-full bg-[#c9a96e] border-2 border-[#0a0e1a] shadow-[0_0_10px_rgba(201,169,110,0.4)]" />
                    <div className="bg-[#0f1629]/80 backdrop-blur-sm rounded-xl p-5 border border-[#c9a96e]/20 hover:border-[#c9a96e]/40 transition-colors">
                      {story.date && <p className="text-xs text-[#c9a96e] font-serif mb-1">{story.date}</p>}
                      <h4 className="font-serif text-[#e8d5a3]">{story.title}</h4>
                      <p className="text-sm text-[#f8f4e8]/50 mt-2 leading-relaxed">{story.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        )}
        {invitation.loveStories.length === 0 && <div id="galaxy-story" />}

        <GalaxyDivider />

        {/* GALERI */}
        <section id="galaxy-galeri" className="py-16 px-6 md:px-12">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-5xl mx-auto">
            <motion.h2 variants={fadeInUp} className="text-2xl md:text-3xl font-serif text-[#e8d5a3] mb-10 text-center">Galeri</motion.h2>
            {invitation.gallery.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {invitation.gallery.map((photo, i) => (
                  <motion.div key={photo.id} variants={fadeInUp}
                    className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative border border-[#c9a96e]/10 hover:border-[#c9a96e]/40 transition-all"
                    onClick={() => setLightboxImage(photo.imageUrl)}>
                    <img src={photo.imageUrl} alt={`Foto ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[#c9a96e] text-2xl">&#10022;</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[#f8f4e8]/30 font-serif">Belum ada foto</p>
            )}
          </motion.div>
        </section>

        {/* Lightbox */}
        <AnimatePresence>
          {lightboxImage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0a0e1a]/95 backdrop-blur-sm p-4" onClick={() => setLightboxImage(null)}>
              <motion.img initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
                src={lightboxImage} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-lg border border-[#c9a96e]/20" />
              <button onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-[#0f1629]/80 border border-[#c9a96e]/30 rounded-full flex items-center justify-center text-[#c9a96e] text-xl hover:bg-[#c9a96e]/10">
                &#10005;
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <GalaxyDivider />

        {/* HADIAH */}
        <section id="galaxy-hadiah" className="py-16 px-6 md:px-12">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-2xl mx-auto">
            <motion.h2 variants={fadeInUp} className="text-2xl md:text-3xl font-serif text-[#e8d5a3] mb-4 text-center">Hadiah</motion.h2>
            <motion.p variants={fadeInUp} className="text-[#f8f4e8]/40 text-center mb-8 text-sm font-serif">
              Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika Anda ingin memberikan tanda kasih, kami menyediakan informasi berikut.
            </motion.p>
            {invitation.giftAccounts.length > 0 ? (
              <div className="space-y-4">
                {invitation.giftAccounts.map((account) => (
                  <motion.div key={account.id} variants={fadeInUp}
                    className="bg-[#0f1629]/80 backdrop-blur-sm rounded-xl p-5 border border-[#c9a96e]/20 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#c9a96e] font-serif uppercase tracking-wide">{account.bankName}</p>
                      <p className="text-[#f8f4e8] font-mono text-lg mt-1">{account.accountNumber}</p>
                      <p className="text-[#f8f4e8]/40 text-sm mt-0.5">a.n. {account.accountHolder}</p>
                    </div>
                    <button onClick={() => copyToClipboard(account.accountNumber, account.id)}
                      className={`px-4 py-2 rounded-full text-sm font-serif transition-all ${
                        copiedAccount === account.id ? "bg-[#c9a96e] text-[#0a0e1a]" : "border border-[#c9a96e]/40 text-[#c9a96e] hover:bg-[#c9a96e]/10"
                      }`}>
                      {copiedAccount === account.id ? "&#10003; Copied" : "Copy"}
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[#f8f4e8]/30 font-serif">Belum ada informasi hadiah</p>
            )}
          </motion.div>
        </section>

        <GalaxyDivider />

        {/* RSVP */}
        <section id="galaxy-rsvp" className="py-16 px-6 md:px-12">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-2xl mx-auto">
            <motion.h2 variants={fadeInUp} className="text-2xl md:text-3xl font-serif text-[#e8d5a3] mb-8 text-center">RSVP & Ucapan</motion.h2>
            <motion.form variants={fadeInUp} onSubmit={handleSubmitComment}
              className="bg-[#0f1629]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#c9a96e]/20 mb-8">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-[#c9a96e]/70 block mb-1 font-serif">Nama</label>
                  <input type="text" value={commentName} onChange={(e) => setCommentName(e.target.value)}
                    className="w-full bg-[#0a0e1a]/60 border border-[#c9a96e]/20 rounded-lg px-4 py-2.5 text-[#f8f4e8] placeholder-[#f8f4e8]/20 focus:outline-none focus:border-[#c9a96e]/60 transition-colors"
                    placeholder="Nama Anda" required />
                </div>
                <div>
                  <label className="text-sm text-[#c9a96e]/70 block mb-1 font-serif">Kehadiran</label>
                  <select value={commentAttendance} onChange={(e) => setCommentAttendance(e.target.value)}
                    className="w-full bg-[#0a0e1a]/60 border border-[#c9a96e]/20 rounded-lg px-4 py-2.5 text-[#f8f4e8] focus:outline-none focus:border-[#c9a96e]/60 transition-colors">
                    <option value="hadir">Hadir</option>
                    <option value="tidak_hadir">Tidak Hadir</option>
                    <option value="ragu">Masih Ragu</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-[#c9a96e]/70 block mb-1 font-serif">Ucapan</label>
                  <textarea value={commentMessage} onChange={(e) => setCommentMessage(e.target.value)} rows={3}
                    className="w-full bg-[#0a0e1a]/60 border border-[#c9a96e]/20 rounded-lg px-4 py-2.5 text-[#f8f4e8] placeholder-[#f8f4e8]/20 focus:outline-none focus:border-[#c9a96e]/60 transition-colors resize-none"
                    placeholder="Tulis ucapan untuk mempelai..." required />
                </div>
                <button type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#c9a96e] to-[#e8d5a3] text-[#0a0e1a] font-serif font-bold rounded-full hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(201,169,110,0.3)]">
                  Kirim Ucapan
                </button>
              </div>
            </motion.form>
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
              {comments.length > 0 ? (
                comments.map((comment, idx) => (
                  <div key={comment.id || `comment-${idx}`} className="bg-[#0f1629]/80 backdrop-blur-sm rounded-xl p-4 border border-[#c9a96e]/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-serif text-[#e8d5a3] text-sm">{comment.guestName || "Anonim"}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-serif ${
                        comment.attendance === "hadir" ? "bg-[#c9a96e]/20 text-[#c9a96e]"
                        : comment.attendance === "tidak_hadir" ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {comment.attendance === "tidak_hadir" ? "Tidak Hadir" : comment.attendance === "ragu" ? "Ragu" : "Hadir"}
                      </span>
                    </div>
                    <p className="text-[#f8f4e8]/50 text-sm">{comment.message}</p>
                    {comment.createdAt && (
                      <p className="text-[#f8f4e8]/20 text-xs mt-2">
                        {new Date(comment.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-[#f8f4e8]/30 py-8 font-serif">Belum ada ucapan. Jadilah yang pertama!</p>
              )}
            </div>
          </motion.div>
        </section>

        {/* FOOTER */}
        <footer className="py-12 px-6 text-center relative">
          <FloatingParticles count={8} />
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative z-10">
            <p className="text-[#f8f4e8]/40 text-sm mb-2 font-serif">Terima kasih atas doa & kehadiran Anda</p>
            <p className="text-xl font-serif text-[#e8d5a3]">
              {invitation.groomName} <span className="text-[#c9a96e]">&</span> {invitation.brideName}
            </p>
            {invitation.hashtag && <p className="text-sm text-[#c9a96e] mt-2 font-serif">{invitation.hashtag}</p>}
            <p className="text-xs text-[#f8f4e8]/20 mt-6">Made with &#10022;</p>
          </motion.div>
        </footer>
      </div>

      {/* MUSIC PLAYER BAR */}
      {invitation.musicUrl && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#c9a96e]/20 px-4 py-2"
          style={{ background: "linear-gradient(180deg, #0f1629 0%, #0a0e1a 100%)" }}>
          <div className="flex items-center justify-between max-w-screen-2xl mx-auto gap-4">
            <div className="flex items-center gap-3 min-w-0 w-1/4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1a1040] to-[#0f1629] border border-[#c9a96e]/20 flex items-center justify-center shrink-0">
                <span className="text-[#c9a96e] text-sm">&#10022;</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-[#e8d5a3] truncate font-serif">Wedding Song</p>
                <p className="text-[10px] text-[#f8f4e8]/30 truncate">{invitation.groomName} & {invitation.brideName}</p>
              </div>
            </div>
            <div className="flex flex-col items-center flex-1 max-w-[600px]">
              <div className="flex items-center gap-4 mb-1">
                <button onClick={togglePlay}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9a96e] to-[#e8d5a3] flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_15px_rgba(201,169,110,0.3)]"
                  aria-label={isPlaying ? "Pause" : "Play"}>
                  {isPlaying ? (
                    <svg className="w-4 h-4 text-[#0a0e1a]" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-[#0a0e1a] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2 w-full">
                <span className="text-[10px] text-[#f8f4e8]/40 w-8 text-right">{formatTime(currentTime)}</span>
                <input type="range" min={0} max={duration || 100} value={currentTime} onChange={seekTo}
                  className="flex-1 h-1 accent-[#c9a96e] bg-[#1a1040] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#c9a96e]" />
                <span className="text-[10px] text-[#f8f4e8]/40 w-8">{formatTime(duration)}</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 w-1/4 justify-end">
              <svg className="w-4 h-4 text-[#c9a96e]/60" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
              <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24 h-1 accent-[#c9a96e] bg-[#1a1040] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#c9a96e]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
