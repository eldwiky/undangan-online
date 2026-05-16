"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Caveat, Patrick_Hand } from "next/font/google";
import type { SerializedInvitation, SerializedComment } from "@/app/(public)/[slug]/InvitationClient";
import { calculateCountdown } from "@/lib/utils";
import MusicPlayer from "@/components/invitation/MusicPlayer";

// ═══════════ FONTS ═══════════
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-caveat",
});

const patrickHand = Patrick_Hand({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-patrick-hand",
});

// ═══════════ COLOR CONSTANTS ═══════════
const COLORS = {
  background: "#F5F0E8",      // Beige/cream
  accent: "#047857",          // Emerald green
  accentDark: "#065F46",      // Dark emerald (headings)
  text: "#374151",            // Dark gray (body)
  textLight: "#6B7280",       // Light gray (secondary)
  white: "#FFFFFF",
} as const;

// ═══════════ COMMON SVG DECORATION PROPS ═══════════
const decorationProps = {
  "aria-hidden": "true" as const,
  role: "presentation" as const,
  stroke: COLORS.accent,
  fill: "none",
  strokeWidth: 1.5,
};

// ═══════════ INTERFACES ═══════════
interface DoodleTemplateProps {
  invitation: SerializedInvitation;
  guestName?: string | null;
}

// ═══════════ SVG SUB-COMPONENTS ═══════════

/** Corner ribbon decoration SVG - positioned at viewport corners */
function CornerRibbon({ position }: { position: "top-left" | "top-right" | "bottom-left" | "bottom-right" }) {
  const transforms: Record<string, string> = {
    "top-left": "",
    "top-right": "scaleX(-1)",
    "bottom-left": "scaleY(-1)",
    "bottom-right": "scale(-1)",
  };

  const positionClasses: Record<string, string> = {
    "top-left": "top-3 left-3 md:top-6 md:left-6",
    "top-right": "top-3 right-3 md:top-6 md:right-6",
    "bottom-left": "bottom-3 left-3 md:bottom-6 md:left-6",
    "bottom-right": "bottom-3 right-3 md:bottom-6 md:right-6",
  };

  return (
    <svg
      {...decorationProps}
      className={`absolute w-12 h-12 md:w-16 md:h-16 pointer-events-none ${positionClasses[position]}`}
      viewBox="0 0 60 60"
      style={{ transform: transforms[position] }}
    >
      {/* Wavy ribbon corner */}
      <path d="M5 2 C15 4, 25 3, 35 5 C40 6, 45 4, 50 5" strokeLinecap="round" />
      <path d="M2 5 C4 15, 3 25, 5 35 C6 40, 4 45, 5 50" strokeLinecap="round" />
      {/* Small decorative curl */}
      <path d="M8 8 C12 10, 10 14, 8 12" strokeLinecap="round" />
      {/* Leaf accent */}
      <path d="M15 3 C18 6, 16 10, 13 8 C16 6, 18 4, 15 3" strokeLinecap="round" />
      <path d="M3 15 C6 18, 10 16, 8 13 C6 16, 4 18, 3 15" strokeLinecap="round" />
    </svg>
  );
}

/** Couple illustration SVG - two figures holding a heart with event date */
function CoupleIllustration({ eventDate }: { eventDate: string }) {
  const date = new Date(eventDate);
  const day = date.getDate();
  const month = date.toLocaleDateString("id-ID", { month: "short" });
  const year = date.getFullYear();
  const dateStr = `${day} ${month} ${year}`;

  return (
    <svg
      {...decorationProps}
      className="w-48 h-48 md:w-64 md:h-64 mx-auto"
      viewBox="0 0 200 200"
    >
      {/* Left figure (groom) */}
      {/* Head */}
      <circle cx="65" cy="60" r="14" strokeWidth={1.5} />
      {/* Body */}
      <path d="M65 74 C65 74, 60 100, 58 120 C56 130, 55 140, 55 155" strokeLinecap="round" strokeWidth={1.5} />
      {/* Left arm reaching to heart */}
      <path d="M65 85 C70 88, 78 90, 85 88" strokeLinecap="round" strokeWidth={1.5} />
      {/* Right arm */}
      <path d="M65 85 C58 90, 50 95, 45 92" strokeLinecap="round" strokeWidth={1.5} />
      {/* Left leg */}
      <path d="M58 120 C56 135, 50 150, 48 165" strokeLinecap="round" strokeWidth={1.5} />
      {/* Right leg */}
      <path d="M58 120 C60 135, 62 150, 64 165" strokeLinecap="round" strokeWidth={1.5} />
      {/* Hair detail */}
      <path d="M55 52 C58 46, 68 44, 75 50" strokeLinecap="round" strokeWidth={1} />

      {/* Right figure (bride) */}
      {/* Head */}
      <circle cx="135" cy="60" r="14" strokeWidth={1.5} />
      {/* Body (dress shape) */}
      <path d="M135 74 C135 74, 130 90, 125 110 C120 130, 115 150, 110 165" strokeLinecap="round" strokeWidth={1.5} />
      <path d="M135 74 C135 74, 140 90, 145 110 C150 130, 155 150, 160 165" strokeLinecap="round" strokeWidth={1.5} />
      {/* Dress bottom curve */}
      <path d="M110 165 C120 162, 140 160, 160 165" strokeLinecap="round" strokeWidth={1.5} />
      {/* Left arm reaching to heart */}
      <path d="M135 85 C130 88, 122 90, 115 88" strokeLinecap="round" strokeWidth={1.5} />
      {/* Right arm */}
      <path d="M135 85 C142 90, 150 95, 155 92" strokeLinecap="round" strokeWidth={1.5} />
      {/* Hair detail (longer) */}
      <path d="M125 50 C128 44, 138 42, 145 48" strokeLinecap="round" strokeWidth={1} />
      <path d="M145 50 C148 56, 148 64, 146 70" strokeLinecap="round" strokeWidth={1} />
      {/* Veil hint */}
      <path d="M125 48 C122 52, 120 60, 122 68" strokeLinecap="round" strokeWidth={1} />

      {/* Heart between them */}
      <path
        d="M100 78 C100 72, 92 68, 88 74 C84 80, 88 86, 100 96 C112 86, 116 80, 112 74 C108 68, 100 72, 100 78Z"
        strokeWidth={1.8}
        fill="none"
      />

      {/* Event date text inside heart */}
      <text
        x="100"
        y="86"
        textAnchor="middle"
        fontSize="7"
        fontFamily="var(--font-caveat)"
        fill={COLORS.accent}
        stroke="none"
      >
        {dateStr}
      </text>

      {/* Small decorative hearts floating */}
      <path d="M45 40 C45 38, 43 37, 42 38 C41 39, 41 40, 45 43 C49 40, 49 39, 48 38 C47 37, 45 38, 45 40Z" strokeWidth={1} />
      <path d="M155 40 C155 38, 153 37, 152 38 C151 39, 151 40, 155 43 C159 40, 159 39, 158 38 C157 37, 155 38, 155 40Z" strokeWidth={1} />
      <path d="M100 35 C100 33, 98 32, 97 33 C96 34, 96 35, 100 38 C104 35, 104 34, 103 33 C102 32, 100 33, 100 35Z" strokeWidth={1} />
    </svg>
  );
}

/** Hand-drawn leaf/botanical doodle SVG accent */
function LeafDoodle({ className = "" }: { className?: string }) {
  return (
    <svg
      {...decorationProps}
      className={`w-8 h-8 md:w-10 md:h-10 ${className}`}
      viewBox="0 0 40 40"
    >
      {/* Main leaf shape */}
      <path
        d="M20 36 C20 36, 12 28, 10 20 C8 12, 12 6, 20 4 C28 6, 32 12, 30 20 C28 28, 20 36, 20 36Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Center vein */}
      <path d="M20 8 C20 12, 20 24, 20 34" strokeLinecap="round" strokeWidth={1} />
      {/* Side veins */}
      <path d="M20 14 C16 12, 14 14, 13 16" strokeLinecap="round" strokeWidth={1} />
      <path d="M20 14 C24 12, 26 14, 27 16" strokeLinecap="round" strokeWidth={1} />
      <path d="M20 20 C16 19, 13 20, 12 22" strokeLinecap="round" strokeWidth={1} />
      <path d="M20 20 C24 19, 27 20, 28 22" strokeLinecap="round" strokeWidth={1} />
      <path d="M20 26 C17 25, 15 26, 14 28" strokeLinecap="round" strokeWidth={1} />
      <path d="M20 26 C23 25, 25 26, 26 28" strokeLinecap="round" strokeWidth={1} />
    </svg>
  );
}

/** Hand-drawn wavy/sketchy line separator between sections */
function DoodleDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center py-6 md:py-8 ${className}`}>
      <svg
        aria-hidden="true"
        role="presentation"
        className="w-48 h-4 md:w-64 md:h-5"
        viewBox="0 0 200 20"
        fill="none"
        stroke={COLORS.accent}
        strokeWidth={1.5}
      >
        {/* Wavy hand-drawn line */}
        <path
          d="M10 10 C20 6, 30 14, 40 10 C50 6, 60 14, 70 10 C80 6, 90 14, 100 10 C110 6, 120 14, 130 10 C140 6, 150 14, 160 10 C170 6, 180 14, 190 10"
          strokeLinecap="round"
        />
        {/* Small leaf accent at center */}
        <path
          d="M96 4 C98 2, 102 2, 104 4 C102 6, 98 6, 96 4Z"
          strokeWidth={1}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/** Doodle heart accent SVG */
function DoodleHeart({ className = "" }: { className?: string }) {
  return (
    <svg
      {...decorationProps}
      className={`w-5 h-5 md:w-6 md:h-6 ${className}`}
      viewBox="0 0 24 24"
    >
      <path
        d="M12 6 C12 4, 10 2, 8 3 C6 4, 6 6, 12 12 C18 6, 18 4, 16 3 C14 2, 12 4, 12 6Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** SketchyCircleBorder - hand-drawn circular SVG frame for profile photos */
function SketchyCircleBorder({
  children,
  size = 140,
  className = "",
}: {
  children: React.ReactNode;
  size?: number;
  className?: string;
}) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Hand-drawn circle border */}
      <svg
        aria-hidden="true"
        role="presentation"
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 140 140"
        fill="none"
        stroke={COLORS.accent}
        strokeWidth={1.8}
      >
        {/* Sketchy circle - slightly irregular path to simulate hand-drawn */}
        <path
          d="M70 5 C95 3, 120 20, 130 45 C140 70, 135 100, 115 120 C95 138, 65 140, 40 130 C15 118, 3 95, 5 70 C7 45, 25 15, 50 7 C60 4, 65 5, 70 5Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Second slightly offset circle for sketchy effect */}
        <path
          d="M70 8 C93 6, 117 22, 127 47 C137 72, 132 98, 113 117 C93 135, 67 137, 43 127 C18 115, 6 93, 8 68 C10 43, 28 18, 52 10 C60 7, 66 8, 70 8Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          opacity={0.5}
        />
      </svg>
      {/* Content (photo or placeholder) */}
      <div
        className="relative rounded-full overflow-hidden"
        style={{ width: size - 20, height: size - 20 }}
      >
        {children}
      </div>
    </div>
  );
}

/** Doodle-style placeholder when photo is null - person silhouette in emerald green outline */
function DoodlePlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: COLORS.background }}>
      <svg
        aria-hidden="true"
        role="presentation"
        className="w-3/5 h-3/5"
        viewBox="0 0 60 60"
        fill="none"
        stroke={COLORS.accent}
        strokeWidth={1.5}
      >
        {/* Head */}
        <circle cx="30" cy="20" r="10" strokeLinecap="round" />
        {/* Body/shoulders */}
        <path d="M15 55 C15 42, 20 35, 30 33 C40 35, 45 42, 45 55" strokeLinecap="round" />
        {/* Small decorative detail */}
        <path d="M25 20 C27 18, 33 18, 35 20" strokeLinecap="round" strokeWidth={1} />
      </svg>
    </div>
  );
}

/** Hand-drawn ampersand/heart doodle between profiles */
function AmpersandDoodle({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      role="presentation"
      className={`w-12 h-12 md:w-16 md:h-16 ${className}`}
      viewBox="0 0 60 60"
      fill="none"
      stroke={COLORS.accent}
      strokeWidth={1.8}
    >
      {/* Hand-drawn "&" symbol */}
      <path
        d="M30 50 C22 45, 15 40, 15 32 C15 26, 20 22, 25 22 C30 22, 34 25, 34 30 C34 35, 28 38, 22 42 C28 46, 35 48, 40 44 C45 40, 42 34, 38 30 C34 26, 30 22, 30 16 C30 10, 35 8, 38 10 C41 12, 40 16, 38 18"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Small heart accent */}
      <path
        d="M44 12 C44 10, 42 9, 41 10 C40 11, 40 12, 44 15 C48 12, 48 11, 47 10 C46 9, 44 10, 44 12Z"
        strokeWidth={1.2}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Sketchy border SVG - hand-drawn rectangle with irregular stroke */
function SketchyRectBorder({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {/* Hand-drawn rectangle border */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 120 80"
        preserveAspectRatio="none"
        aria-hidden="true"
        role="presentation"
        fill="none"
        stroke={COLORS.accent}
        strokeWidth={1.5}
      >
        {/* Top edge - slightly wavy */}
        <path d="M4 4 C20 3, 40 5, 60 4 C80 3, 100 5, 116 4" strokeLinecap="round" />
        {/* Right edge */}
        <path d="M116 4 C117 20, 115 40, 116 60 C117 68, 116 74, 116 76" strokeLinecap="round" />
        {/* Bottom edge */}
        <path d="M116 76 C100 77, 80 75, 60 76 C40 77, 20 75, 4 76" strokeLinecap="round" />
        {/* Left edge */}
        <path d="M4 76 C3 60, 5 40, 4 20 C3 12, 4 6, 4 4" strokeLinecap="round" />
      </svg>
      {children}
    </div>
  );
}

// ═══════════ COUNTDOWN SUB-COMPONENT ═══════════
function DoodleCountdown({ eventDate }: { eventDate: string }) {
  const [countdown, setCountdown] = useState(() =>
    calculateCountdown(new Date(eventDate))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(calculateCountdown(new Date(eventDate)));
    }, 1000);
    return () => clearInterval(interval);
  }, [eventDate]);

  const units = [
    { value: countdown.days, label: "Hari" },
    { value: countdown.hours, label: "Jam" },
    { value: countdown.minutes, label: "Menit" },
    { value: countdown.seconds, label: "Detik" },
  ];

  if (countdown.isPast) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-12 md:py-16 px-4 text-center"
      >
        <p
          className="text-2xl md:text-3xl italic"
          style={{
            fontFamily: "var(--font-caveat)",
            color: COLORS.accent,
          }}
        >
          Acara telah berlangsung
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="py-12 md:py-16 px-4"
    >
      <div className="max-w-lg mx-auto text-center">
        {/* Section heading */}
        <h2
          className="text-2xl md:text-3xl font-bold mb-8"
          style={{
            fontFamily: "var(--font-caveat)",
            color: COLORS.accentDark,
          }}
        >
          Menghitung Hari
        </h2>

        {/* Countdown units */}
        <div className="flex justify-center items-center gap-3 md:gap-5 relative">
          {/* Left leaf accent */}
          <LeafDoodle className="absolute -left-2 -top-4 md:left-0 md:-top-6 opacity-50 -rotate-45 pointer-events-none" />

          {units.map((unit) => (
            <SketchyRectBorder
              key={unit.label}
              className="flex flex-col items-center justify-center w-16 h-20 md:w-20 md:h-24"
            >
              <span
                className="text-2xl md:text-4xl font-bold relative z-10"
                style={{
                  fontFamily: "var(--font-caveat)",
                  color: COLORS.accent,
                }}
              >
                {unit.value}
              </span>
              <span
                className="text-sm relative z-10 mt-1"
                style={{
                  fontFamily: "var(--font-patrick-hand)",
                  color: COLORS.text,
                }}
              >
                {unit.label}
              </span>
            </SketchyRectBorder>
          ))}

          {/* Right leaf accent */}
          <LeafDoodle className="absolute -right-2 -bottom-4 md:right-0 md:-bottom-6 opacity-50 rotate-45 pointer-events-none" />
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════ INDONESIAN DATE/TIME FORMATTING HELPERS ═══════════

const INDONESIAN_DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const INDONESIAN_MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/** Format date in Indonesian locale: "DayName, DD MonthName YYYY" */
export function formatIndonesianDate(dateStr: string): string {
  const date = new Date(dateStr);
  const dayName = INDONESIAN_DAYS[date.getDay()];
  const day = date.getDate();
  const month = INDONESIAN_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${day} ${month} ${year}`;
}

/** Format time: "HH:MM - HH:MM WIB" or "HH:MM WIB" */
export function formatEventTime(startTime: string | null, endTime: string | null): string {
  if (!startTime) return "";
  if (endTime) {
    return `${startTime} - ${endTime} WIB`;
  }
  return `${startTime} WIB`;
}

/** Check if an event date has passed */
function isEventPast(dateStr: string): boolean {
  const eventDate = new Date(dateStr);
  const now = new Date();
  // Set to end of day for the event
  eventDate.setHours(23, 59, 59, 999);
  return now > eventDate;
}

/** Generate Google Calendar URL for Save the Date */
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

/** Generate ICS file content for Save the Date */
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

/** Handle Save the Date action - Google Calendar for Android, ICS for iOS/Desktop */
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

// ═══════════ DOODLE ICONS FOR EVENTS ═══════════

/** Ring icon for Akad - hand-drawn style, 24-32px */
function RingIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      role="presentation"
      className={`w-7 h-7 md:w-8 md:h-8 ${className}`}
      viewBox="0 0 32 32"
      fill="none"
      stroke={COLORS.accent}
      strokeWidth={1.5}
    >
      {/* Ring band */}
      <ellipse cx="16" cy="20" rx="9" ry="8" strokeLinecap="round" />
      {/* Diamond/gem on top */}
      <path d="M12 12 L16 8 L20 12 L16 15 Z" strokeLinecap="round" strokeLinejoin="round" />
      {/* Small sparkle lines */}
      <path d="M16 5 L16 3" strokeLinecap="round" strokeWidth={1} />
      <path d="M11 9 L9 7" strokeLinecap="round" strokeWidth={1} />
      <path d="M21 9 L23 7" strokeLinecap="round" strokeWidth={1} />
    </svg>
  );
}

/** Dove/merpati icon for Resepsi - hand-drawn style, 24-32px */
function CelebrationIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      role="presentation"
      className={`w-7 h-7 md:w-8 md:h-8 ${className}`}
      viewBox="0 0 32 32"
      fill="none"
      stroke={COLORS.accent}
      strokeWidth={1.5}
    >
      {/* Dove body */}
      <path d="M8 20 C6 18, 6 14, 10 12 C14 10, 18 11, 20 13 C22 15, 22 18, 20 20 C18 22, 12 22, 8 20Z" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dove head */}
      <circle cx="21" cy="12" r="3" strokeWidth={1.5} />
      {/* Beak */}
      <path d="M24 12 L26 11.5 L24 13" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} />
      {/* Wing */}
      <path d="M10 16 C8 13, 6 10, 4 8 C6 9, 9 10, 12 12" strokeLinecap="round" strokeWidth={1.2} />
      <path d="M12 15 C10 12, 8 9, 7 6 C9 8, 11 10, 14 13" strokeLinecap="round" strokeWidth={1.2} />
      {/* Tail */}
      <path d="M8 20 C5 21, 3 23, 2 26 C4 24, 6 22, 8 21" strokeLinecap="round" strokeWidth={1.2} />
      {/* Olive branch */}
      <path d="M26 13 C27 14, 28 16, 29 17" strokeLinecap="round" strokeWidth={1} />
      <path d="M28 15 C29 14, 30 14, 30 13" strokeLinecap="round" strokeWidth={1} />
      <path d="M29 16 C30 15, 31 15, 31 14" strokeLinecap="round" strokeWidth={1} />
    </svg>
  );
}

// ═══════════ EVENTS SECTION SUB-COMPONENT ═══════════

/** Wavy border button component for events section */
function WavyBorderButton({
  children,
  onClick,
  href,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
}) {
  const buttonContent = (
    <span className="relative z-10 flex items-center justify-center gap-2">
      {children}
    </span>
  );

  const commonClasses = `relative inline-flex items-center justify-center px-5 py-2.5 md:px-6 md:py-3 text-sm md:text-base font-medium rounded-md cursor-pointer min-h-[44px] min-w-[44px] transition-transform hover:scale-105 active:scale-95 ${className}`;

  const wavySvg = (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 200 50"
      preserveAspectRatio="none"
      aria-hidden="true"
      role="presentation"
    >
      <rect
        x="2"
        y="2"
        width="196"
        height="46"
        rx="6"
        ry="6"
        fill="none"
        stroke={COLORS.accent}
        strokeWidth="2"
        strokeDasharray="8 4"
        strokeLinecap="round"
        style={{ filter: "url(#wavyBorderFilter)" }}
      />
      <defs>
        <filter id="wavyBorderFilter">
          <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="2" result="turbulence" />
          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={commonClasses}
        style={{ color: COLORS.accent, fontFamily: "var(--font-patrick-hand)" }}
      >
        {wavySvg}
        {buttonContent}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      className={commonClasses}
      style={{ color: COLORS.accent, fontFamily: "var(--font-patrick-hand)" }}
    >
      {wavySvg}
      {buttonContent}
    </button>
  );
}

/** Single event card (Akad or Resepsi) */
function EventCard({
  type,
  date,
  startTime,
  endTime,
  venue,
  address,
  mapsUrl,
  groomName,
  brideName,
}: {
  type: "akad" | "resepsi";
  date: string;
  startTime: string | null;
  endTime: string | null;
  venue: string | null;
  address: string | null;
  mapsUrl: string | null;
  groomName: string;
  brideName: string;
}) {
  const isPast = isEventPast(date);
  const formattedDate = formatIndonesianDate(date);
  const formattedTime = formatEventTime(startTime, endTime);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative p-6 md:p-8"
    >
      {/* Hand-drawn card border */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 300 400"
        preserveAspectRatio="none"
        aria-hidden="true"
        role="presentation"
        fill="none"
        stroke={COLORS.accent}
        strokeWidth={1.5}
      >
        <path
          d="M10 8 C50 5, 100 10, 150 7 C200 4, 250 9, 290 8 C293 50, 291 100, 292 150 C293 200, 291 250, 292 300 C293 340, 291 370, 290 392 C250 395, 200 390, 150 393 C100 396, 50 391, 10 392 C7 350, 9 300, 8 250 C7 200, 9 150, 8 100 C7 50, 9 20, 10 8Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Card content */}
      <div className="relative z-10 text-center">
        {/* Doodle icon */}
        <div className="flex justify-center mb-3">
          {type === "akad" ? <RingIcon /> : <CelebrationIcon />}
        </div>

        {/* Event title */}
        <h3
          className="text-2xl md:text-3xl font-bold mb-4"
          style={{
            fontFamily: "var(--font-caveat)",
            color: COLORS.accentDark,
          }}
        >
          {type === "akad" ? "Akad Nikah" : "Resepsi"}
        </h3>

        {/* Date */}
        <p
          className="text-base md:text-lg font-medium mb-1"
          style={{
            fontFamily: "var(--font-patrick-hand)",
            color: COLORS.text,
          }}
        >
          {formattedDate}
        </p>

        {/* Time */}
        {formattedTime && (
          <p
            className="text-sm md:text-base mb-4"
            style={{
              fontFamily: "var(--font-patrick-hand)",
              color: COLORS.textLight,
            }}
          >
            {formattedTime}
          </p>
        )}

        {/* Venue name */}
        {venue && (
          <p
            className="text-base md:text-lg font-bold mt-4"
            style={{
              fontFamily: "var(--font-caveat)",
              color: COLORS.text,
            }}
          >
            {venue}
          </p>
        )}

        {/* Address */}
        {address && (
          <p
            className="text-sm md:text-base mt-1"
            style={{
              fontFamily: "var(--font-patrick-hand)",
              color: COLORS.textLight,
            }}
          >
            {address}
          </p>
        )}

        {/* Action buttons removed - moved to below the cards grid */}
      </div>
    </motion.div>
  );
}

/** DoodleEvents - Events section with Akad and Resepsi cards */
function DoodleEvents({ invitation }: { invitation: SerializedInvitation }) {
  return (
    <section className="py-16 md:py-20 px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-3xl mx-auto"
      >
        {/* Section heading */}
        <div className="flex items-center justify-center gap-2 mb-10 md:mb-12">
          <DoodleHeart className="opacity-70" />
          <h2
            className="text-2xl md:text-3xl font-bold"
            style={{
              fontFamily: "var(--font-caveat)",
              color: COLORS.accentDark,
            }}
          >
            Acara Pernikahan
          </h2>
          <DoodleHeart className="opacity-70" />
        </div>

        {/* LeafDoodle accent */}
        <div className="flex justify-center mb-6">
          <LeafDoodle className="opacity-40" />
        </div>

        {/* Event cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Akad card - only render when akadDate is provided */}
          {invitation.akadDate && (
            <EventCard
              type="akad"
              date={invitation.akadDate}
              startTime={invitation.akadTime}
              endTime={invitation.akadTimeEnd}
              venue={invitation.akadLocationName}
              address={invitation.akadLocation}
              mapsUrl={invitation.akadMapsUrl}
              groomName={invitation.groomName}
              brideName={invitation.brideName}
            />
          )}

          {/* Resepsi card - only render when resepsiDate is provided */}
          {invitation.resepsiDate && (
            <EventCard
              type="resepsi"
              date={invitation.resepsiDate}
              startTime={invitation.resepsiTime}
              endTime={invitation.resepsiTimeEnd}
              venue={invitation.resepsiLocationName}
              address={invitation.resepsiLocation}
              mapsUrl={invitation.resepsiMapsUrl}
              groomName={invitation.groomName}
              brideName={invitation.brideName}
            />
          )}
        </div>

        {/* Single Buka Maps & Save the Date buttons below cards */}
        <div className="flex flex-col items-center gap-3 mt-8">
          {/* Buka Maps - use first available maps URL */}
          {(invitation.akadMapsUrl || invitation.resepsiMapsUrl) && (
            <WavyBorderButton href={invitation.akadMapsUrl || invitation.resepsiMapsUrl || ""}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Buka Maps
            </WavyBorderButton>
          )}

          {/* Save the Date - use first available event date, hidden when past */}
          {(() => {
            const eventDate = invitation.akadDate || invitation.resepsiDate;
            if (!eventDate || isEventPast(eventDate)) return null;
            const startTime = invitation.akadDate ? invitation.akadTime : invitation.resepsiTime;
            const endTime = invitation.akadDate ? invitation.akadTimeEnd : invitation.resepsiTimeEnd;
            const venue = invitation.akadDate ? invitation.akadLocationName : invitation.resepsiLocationName;
            const address = invitation.akadDate ? invitation.akadLocation : invitation.resepsiLocation;
            return (
              <WavyBorderButton
                onClick={() =>
                  handleSaveTheDate(invitation.groomName, invitation.brideName, eventDate, startTime, endTime, venue, address)
                }
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Save the Date
              </WavyBorderButton>
            );
          })()}
        </div>
      </motion.div>
    </section>
  );
}

// ═══════════ GALLERY SUB-COMPONENT ═══════════
function DoodleGallery({ gallery }: { gallery: SerializedInvitation["gallery"] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Hide section entirely when gallery is empty
  if (!gallery || gallery.length === 0) return null;

  // Deterministic rotation based on index (-2 to 2 degrees)
  const getRotation = (index: number): number => {
    const seed = ((index * 7 + 3) % 9) - 4; // produces values -4 to 4
    return (seed / 4) * 2; // normalize to -2 to 2
  };

  return (
    <section className="py-16 md:py-20 px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-4xl mx-auto"
      >
        {/* Section heading */}
        <div className="flex items-center justify-center gap-2 mb-10 md:mb-14">
          <DoodleHeart className="opacity-60" />
          <h2
            className="text-3xl md:text-4xl font-bold text-center"
            style={{ fontFamily: "var(--font-caveat)", color: COLORS.accentDark }}
          >
            Galeri
          </h2>
          <DoodleHeart className="opacity-60" />
        </div>

        {/* LeafDoodle accents */}
        <div className="relative">
          <LeafDoodle className="absolute -top-6 -left-2 opacity-30 -rotate-12 hidden md:block pointer-events-none" />
          <LeafDoodle className="absolute -top-6 -right-2 opacity-30 rotate-12 scale-x-[-1] hidden md:block pointer-events-none" />

          {/* Photo grid: 2 columns mobile, 3 columns ≥768px */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {gallery.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="cursor-pointer"
                style={{ transform: `rotate(${getRotation(index)}deg)` }}
                onClick={() => setLightboxIndex(index)}
              >
                {/* Hand-drawn frame */}
                <div className="relative p-2 md:p-3">
                  {/* Sketchy border SVG */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 120 120"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                    role="presentation"
                    fill="none"
                    stroke={COLORS.accent}
                    strokeWidth={1.5}
                  >
                    <path d="M4 4 C20 3, 40 5, 60 4 C80 3, 100 5, 116 4" strokeLinecap="round" />
                    <path d="M116 4 C117 25, 115 50, 116 75 C117 95, 116 110, 116 116" strokeLinecap="round" />
                    <path d="M116 116 C100 117, 80 115, 60 116 C40 117, 20 115, 4 116" strokeLinecap="round" />
                    <path d="M4 116 C3 95, 5 70, 4 45 C3 25, 4 10, 4 4" strokeLinecap="round" />
                  </svg>
                  {/* Photo */}
                  <img
                    src={photo.imageUrl}
                    alt={`Gallery photo ${index + 1}`}
                    loading="lazy"
                    className="w-full aspect-square object-cover rounded-sm"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Leaf doodle accents at bottom */}
        <div className="flex justify-center mt-8 gap-4 opacity-40">
          <LeafDoodle className="rotate-[-15deg]" />
          <LeafDoodle className="rotate-[15deg] scale-x-[-1]" />
        </div>
      </motion.div>

      {/* Full-screen Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(null);
              }}
              className="absolute top-4 right-4 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Close lightbox"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth={2}
                strokeLinecap="round"
                aria-hidden="true"
                role="presentation"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>

            {/* Lightbox image */}
            <motion.img
              key={gallery[lightboxIndex].id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              src={gallery[lightboxIndex].imageUrl}
              alt={`Gallery photo ${lightboxIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ═══════════ GIFT BOX DOODLE SVG ═══════════
function GiftBoxDoodle({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="48"
      height="48"
      viewBox="0 0 48 48"
      {...decorationProps}
    >
      {/* Gift box body */}
      <path d="M8 22 C8 21, 9 20, 10 20 L38 20 C39 20, 40 21, 40 22 L40 42 C40 43, 39 44, 38 44 L10 44 C9 44, 8 43, 8 42 Z" strokeLinecap="round" />
      {/* Box lid */}
      <path d="M6 16 C6 15, 7 14, 8 14 L40 14 C41 14, 42 15, 42 16 L42 20 L6 20 Z" strokeLinecap="round" />
      {/* Vertical ribbon */}
      <path d="M24 20 L24 44" strokeLinecap="round" />
      {/* Horizontal ribbon */}
      <path d="M8 32 L40 32" strokeLinecap="round" />
      {/* Bow - left loop */}
      <path d="M24 14 C22 10, 18 8, 16 9 C14 10, 14 12, 16 13 C18 14, 22 14, 24 14" strokeLinecap="round" />
      {/* Bow - right loop */}
      <path d="M24 14 C26 10, 30 8, 32 9 C34 10, 34 12, 32 13 C30 14, 26 14, 24 14" strokeLinecap="round" />
      {/* Bow center knot */}
      <circle cx="24" cy="14" r="1.5" fill={COLORS.accent} stroke="none" />
    </svg>
  );
}

// ═══════════ GIFT SECTION SUB-COMPONENT ═══════════
function DoodleGift({ invitation }: { invitation: SerializedInvitation }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!invitation.giftAccounts || invitation.giftAccounts.length === 0) {
    return null;
  }

  const handleCopy = async (accountNumber: string, id: string) => {
    try {
      await navigator.clipboard.writeText(accountNumber);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = accountNumber;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section className="py-16 md:py-20 px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-2xl mx-auto text-center"
      >
        {/* Section heading with gift box doodle */}
        <div className="flex items-center justify-center gap-3 mb-8 md:mb-10">
          <GiftBoxDoodle className="opacity-70" />
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ fontFamily: "var(--font-caveat)", color: COLORS.accentDark }}
          >
            Hadiah
          </h2>
          <GiftBoxDoodle className="opacity-70 scale-x-[-1]" />
        </div>

        <p
          className="text-base md:text-lg mb-8"
          style={{ fontFamily: "var(--font-patrick-hand)", color: COLORS.text }}
        >
          Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika Anda ingin memberikan tanda kasih, kami menyediakan informasi berikut.
        </p>

        {/* Gift account cards */}
        <div className="space-y-6">
          {invitation.giftAccounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <SketchyRectBorder className="p-6 md:p-8">
                {/* Bank name */}
                <h3
                  className="text-xl md:text-2xl font-bold mb-3"
                  style={{ fontFamily: "var(--font-caveat)", color: COLORS.accent }}
                >
                  {account.bankName}
                </h3>

                {/* Account number in monospace */}
                <p
                  className="text-lg md:text-xl tracking-wider mb-2"
                  style={{
                    fontFamily: "'Courier New', Courier, monospace",
                    color: COLORS.text,
                    letterSpacing: "0.1em",
                  }}
                >
                  {account.accountNumber}
                </p>

                {/* Account holder name */}
                <p
                  className="text-sm md:text-base mb-4"
                  style={{ fontFamily: "var(--font-patrick-hand)", color: COLORS.textLight }}
                >
                  a.n. {account.accountHolder}
                </p>

                {/* Copy button */}
                <button
                  onClick={() => handleCopy(account.accountNumber, account.id)}
                  className="relative inline-flex items-center justify-center px-5 py-2.5 text-sm md:text-base font-medium rounded-md cursor-pointer min-h-[44px] min-w-[44px] transition-transform hover:scale-105 active:scale-95"
                  style={{ color: COLORS.accent, fontFamily: "var(--font-patrick-hand)" }}
                >
                  {/* Hand-drawn button border */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 200 50"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                    role="presentation"
                  >
                    <rect
                      x="2"
                      y="2"
                      width="196"
                      height="46"
                      rx="6"
                      ry="6"
                      fill="none"
                      stroke={COLORS.accent}
                      strokeWidth="2"
                      strokeDasharray="8 4"
                      strokeLinecap="round"
                      style={{ filter: "url(#wavyGiftFilter)" }}
                    />
                    <defs>
                      <filter id="wavyGiftFilter">
                        <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="2" result="turbulence" />
                        <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
                      </filter>
                    </defs>
                  </svg>
                  <span className="relative z-10 flex items-center gap-2">
                    {/* Copy icon */}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      role="presentation"
                    >
                      <rect x="5" y="5" width="9" height="9" rx="1" />
                      <path d="M2 11 L2 3 C2 2.4 2.4 2 3 2 L11 2" />
                    </svg>
                    {copiedId === account.id ? "Tersalin!" : "Salin"}
                  </span>
                </button>

                {/* QRIS image */}
                {account.qrisUrl && (
                  <div className="mt-6 flex justify-center">
                    <img
                      src={account.qrisUrl}
                      alt={`QRIS ${account.bankName}`}
                      className="rounded-md"
                      style={{ maxWidth: "200px", width: "100%" }}
                    />
                  </div>
                )}
              </SketchyRectBorder>
            </motion.div>
          ))}
        </div>

        {/* Leaf doodle accents at bottom */}
        <div className="flex justify-center mt-8 gap-4 opacity-40">
          <LeafDoodle className="rotate-[-15deg]" />
          <LeafDoodle className="rotate-[15deg] scale-x-[-1]" />
        </div>
      </motion.div>
    </section>
  );
}

// ═══════════ SHARE & FOOTER SUB-COMPONENT ═══════════
function DoodleShareFooter({ invitation }: { invitation: SerializedInvitation }) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback for older browsers
      try {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Copy failed silently
      }
    });
  };

  const shareWhatsApp = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    window.open(
      `https://wa.me/?text=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const shareTelegram = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <section className="py-16 md:py-20 px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="max-w-md mx-auto text-center"
      >
        {/* Thank you message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: "var(--font-caveat)", color: COLORS.accentDark }}
          >
            Terima Kasih
          </p>

          {/* Couple names */}
          <p
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{ fontFamily: "var(--font-caveat)", color: COLORS.accent }}
          >
            {invitation.groomName} & {invitation.brideName}
          </p>

          {/* Hashtag (conditional) */}
          {invitation.hashtag && (
            <p
              className="text-lg md:text-xl mb-6"
              style={{ fontFamily: "var(--font-caveat)", color: COLORS.accent }}
            >
              {invitation.hashtag}
            </p>
          )}

          {/* Leaf doodle accents */}
          <div className="flex justify-center mt-6 mb-8 gap-4 opacity-40">
            <LeafDoodle className="rotate-[-15deg]" />
            <LeafDoodle className="rotate-[15deg] scale-x-[-1]" />
          </div>

          {/* Credit line */}
          <p
            className="text-sm mt-8"
            style={{ color: COLORS.textLight }}
          >
            Made with ♥
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ═══════════ COMMENTS SUB-COMPONENT ═══════════
function DoodleComments({ invitationId, comments: initialComments }: { invitationId: string; comments: SerializedComment[] }) {
  const [comments, setComments] = useState<SerializedComment[]>(
    [...initialComments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  );
  const [form, setForm] = useState({
    guestName: "",
    message: "",
    attendance: "Hadir" as "Hadir" | "Tidak Hadir" | "Ragu-ragu",
  });
  const [errors, setErrors] = useState<{ guestName?: string; message?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);

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
        // Silent fail - don't disrupt UX
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [invitationId]);

  const validate = useCallback((): boolean => {
    const newErrors: { guestName?: string; message?: string } = {};
    if (!form.guestName.trim()) {
      newErrors.guestName = "Nama wajib diisi";
    }
    if (!form.message.trim()) {
      newErrors.message = "Pesan wajib diisi";
    }
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
          attendance: form.attendance === "Hadir" ? "hadir" : form.attendance === "Tidak Hadir" ? "tidak_hadir" : "ragu",
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

  const formatCommentDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getAttendanceLabel = (attendance: string) => {
    switch (attendance) {
      case "hadir": return "✓ Hadir";
      case "tidak_hadir": return "✗ Tidak Hadir";
      case "ragu": return "? Ragu-ragu";
      default: return attendance;
    }
  };

  const visibleComments = comments.slice(0, visibleCount);
  const hasMore = visibleCount < comments.length;

  return (
    <section className="py-16 md:py-20 px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="max-w-lg mx-auto"
      >
        {/* Section heading */}
        <div className="flex items-center justify-center gap-2 mb-8 md:mb-10">
          <DoodleHeart className="opacity-60" />
          <h2
            className="text-3xl md:text-4xl font-bold text-center"
            style={{ fontFamily: "var(--font-caveat)", color: COLORS.accentDark }}
          >
            Ucapan &amp; Doa
          </h2>
          <DoodleHeart className="opacity-60" />
        </div>

        {/* Comment Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="relative p-5 md:p-6 mb-8"
        >
          {/* Hand-drawn form border */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 200 300"
            preserveAspectRatio="none"
            aria-hidden="true"
            role="presentation"
            fill="none"
            stroke={COLORS.accent}
            strokeWidth={1.2}
            strokeOpacity={0.5}
          >
            <path d="M4 4 C50 3, 100 5, 150 4 C175 3, 190 4, 196 4" strokeLinecap="round" />
            <path d="M196 4 C197 75, 195 150, 196 225 C197 260, 196 285, 196 296" strokeLinecap="round" />
            <path d="M196 296 C150 297, 100 295, 50 296 C25 297, 10 296, 4 296" strokeLinecap="round" />
            <path d="M4 296 C3 225, 5 150, 4 75 C3 40, 4 15, 4 4" strokeLinecap="round" />
          </svg>

          {/* Name field */}
          <div className="mb-4">
            <label
              htmlFor="doodle-guest-name"
              className="block text-sm font-medium mb-1.5"
              style={{ fontFamily: "var(--font-patrick-hand)", color: COLORS.text }}
            >
              Nama
            </label>
            <div className="relative">
              <input
                id="doodle-guest-name"
                type="text"
                value={form.guestName}
                onChange={(e) => setForm((prev) => ({ ...prev, guestName: e.target.value }))}
                className="w-full px-3 py-2.5 bg-transparent text-sm focus:outline-none min-h-[44px]"
                style={{
                  fontFamily: "var(--font-patrick-hand)",
                  color: COLORS.text,
                  borderBottom: `2px solid ${COLORS.accent}`,
                  borderTop: "none",
                  borderLeft: "none",
                  borderRight: "none",
                  borderImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='4'%3E%3Cpath d='M0 2 Q25 0 50 2 T100 2 T150 2 T200 2' stroke='%23047857' fill='none' stroke-width='1.5'/%3E%3C/svg%3E") 0 0 2 0 stretch`,
                }}
                placeholder="Nama Anda"
                maxLength={100}
              />
            </div>
            {errors.guestName && (
              <p className="text-sm text-red-500 mt-1" style={{ fontFamily: "var(--font-patrick-hand)" }}>
                {errors.guestName}
              </p>
            )}
          </div>

          {/* Message field */}
          <div className="mb-4">
            <label
              htmlFor="doodle-message"
              className="block text-sm font-medium mb-1.5"
              style={{ fontFamily: "var(--font-patrick-hand)", color: COLORS.text }}
            >
              Ucapan
            </label>
            <div className="relative">
              <textarea
                id="doodle-message"
                value={form.message}
                onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                className="w-full px-3 py-2.5 bg-transparent text-sm focus:outline-none resize-none min-h-[88px]"
                style={{
                  fontFamily: "var(--font-patrick-hand)",
                  color: COLORS.text,
                  borderBottom: `2px solid ${COLORS.accent}`,
                  borderTop: "none",
                  borderLeft: "none",
                  borderRight: "none",
                  borderImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='4'%3E%3Cpath d='M0 2 Q25 0 50 2 T100 2 T150 2 T200 2' stroke='%23047857' fill='none' stroke-width='1.5'/%3E%3C/svg%3E") 0 0 2 0 stretch`,
                }}
                rows={3}
                placeholder="Tulis ucapan & doa..."
                maxLength={500}
              />
            </div>
            {errors.message && (
              <p className="text-sm text-red-500 mt-1" style={{ fontFamily: "var(--font-patrick-hand)" }}>
                {errors.message}
              </p>
            )}
          </div>

          {/* Attendance selection */}
          <div className="mb-5">
            <label
              className="block text-sm font-medium mb-2"
              style={{ fontFamily: "var(--font-patrick-hand)", color: COLORS.text }}
            >
              Kehadiran
            </label>
            <div className="flex flex-wrap gap-2">
              {(["Hadir", "Tidak Hadir", "Ragu-ragu"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, attendance: option }))}
                  className="relative px-4 py-2 text-sm rounded-md transition-all min-h-[44px]"
                  style={{
                    fontFamily: "var(--font-patrick-hand)",
                    color: form.attendance === option ? COLORS.white : COLORS.accent,
                    backgroundColor: form.attendance === option ? COLORS.accent : "transparent",
                    border: `1.5px solid ${COLORS.accent}`,
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="relative w-full py-3 text-base font-medium rounded-md transition-all min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            style={{
              fontFamily: "var(--font-patrick-hand)",
              color: COLORS.white,
              backgroundColor: COLORS.accent,
            }}
          >
            {/* Hand-drawn border overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 200 50"
              preserveAspectRatio="none"
              aria-hidden="true"
              role="presentation"
            >
              <rect
                x="2"
                y="2"
                width="196"
                height="46"
                rx="6"
                ry="6"
                fill="none"
                stroke={COLORS.accentDark}
                strokeWidth="2"
                strokeDasharray="8 4"
                strokeLinecap="round"
                style={{ filter: "url(#commentBtnFilter)" }}
              />
              <defs>
                <filter id="commentBtnFilter">
                  <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="2" result="turbulence" />
                  <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
                </filter>
              </defs>
            </svg>
            {isSubmitting ? "Mengirim..." : "Kirim Ucapan"}
          </button>

          {submitSuccess && (
            <p
              className="text-sm text-center mt-3"
              style={{ fontFamily: "var(--font-patrick-hand)", color: COLORS.accent }}
            >
              Ucapan berhasil dikirim!
            </p>
          )}
          {submitError && (
            <p
              className="text-sm text-center mt-3 text-red-500"
              style={{ fontFamily: "var(--font-patrick-hand)" }}
            >
              {submitError}
            </p>
          )}
        </motion.form>

        {/* Comments List */}
        {visibleComments.length > 0 ? (
          <div className="space-y-4">
            {visibleComments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="relative p-4 md:p-5"
              >
                {/* Speech bubble / card border */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 200 100"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  role="presentation"
                  fill="none"
                  stroke={COLORS.accent}
                  strokeWidth={1}
                  strokeOpacity={0.4}
                >
                  <path d="M6 6 C50 5, 100 7, 150 6 C175 5, 190 6, 194 6" strokeLinecap="round" />
                  <path d="M194 6 C195 25, 193 50, 194 75 C195 85, 194 92, 194 94" strokeLinecap="round" />
                  <path d="M194 94 C150 95, 100 93, 50 94 C25 95, 10 94, 6 94" strokeLinecap="round" />
                  <path d="M6 94 C5 75, 7 50, 6 25 C5 15, 6 8, 6 6" strokeLinecap="round" />
                  {/* Speech bubble tail */}
                  <path d="M20 94 L15 104 L30 94" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

                {/* Comment content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-1.5">
                    <p
                      className="font-bold text-sm md:text-base"
                      style={{ fontFamily: "var(--font-caveat)", color: COLORS.accentDark }}
                    >
                      {comment.guestName}
                    </p>
                    <span
                      className="text-sm"
                      style={{ fontFamily: "var(--font-patrick-hand)", color: COLORS.accent }}
                    >
                      {getAttendanceLabel(comment.attendance)}
                    </span>
                  </div>
                  <p
                    className="text-sm leading-relaxed mb-2"
                    style={{ fontFamily: "var(--font-patrick-hand)", color: COLORS.text }}
                  >
                    {comment.message}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: COLORS.textLight }}
                  >
                    {formatCommentDate(comment.createdAt)}
                  </p>
                </div>
              </motion.div>
            ))}

            {hasMore && (
              <button
                onClick={() => setVisibleCount((prev) => prev + 5)}
                className="w-full py-2.5 text-sm transition-colors min-h-[44px] hover:opacity-80"
                style={{ fontFamily: "var(--font-patrick-hand)", color: COLORS.accent }}
              >
                Lihat lebih banyak ({comments.length - visibleCount} lagi)
              </button>
            )}
          </div>
        ) : (
          <p
            className="text-center text-sm"
            style={{ fontFamily: "var(--font-patrick-hand)", color: COLORS.textLight }}
          >
            Belum ada ucapan. Jadilah yang pertama!
          </p>
        )}

        {/* Leaf doodle accents */}
        <div className="flex justify-center mt-8 gap-4 opacity-40">
          <LeafDoodle className="rotate-[-10deg]" />
          <LeafDoodle className="rotate-[10deg] scale-x-[-1]" />
        </div>
      </motion.div>
    </section>
  );
}

// ═══════════ OPENING SCREEN SUB-COMPONENT ═══════════
function DoodleOpeningScreen({
  invitation,
  guestName,
  onOpen,
}: {
  invitation: SerializedInvitation;
  guestName?: string | null;
  onOpen: () => void;
}) {
  // Determine event date for the illustration
  const eventDate = invitation.akadDate || invitation.resepsiDate || invitation.eventDate;

  return (
    <div
      className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden px-4"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Corner Ribbon Decorations (4 corners) */}
      <CornerRibbon position="top-left" />
      <CornerRibbon position="top-right" />
      <CornerRibbon position="bottom-left" />
      <CornerRibbon position="bottom-right" />

      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm md:max-w-md">
        {/* Small doodle hearts near top */}
        <div className="flex items-center gap-2 mb-2">
          <DoodleHeart className="opacity-60" />
          <DoodleHeart className="opacity-40 w-4 h-4" />
        </div>

        {/* "Save the Date" text */}
        <p
          className="text-xl md:text-2xl mb-1"
          style={{
            fontFamily: "var(--font-patrick-hand)",
            color: COLORS.textLight,
          }}
        >
          Save the Date
        </p>

        {/* Wedding date in DD.MM.YYYY format */}
        <p
          className="text-lg md:text-xl mb-3"
          style={{
            fontFamily: "var(--font-caveat)",
            color: COLORS.accent,
            letterSpacing: "0.05em",
          }}
        >
          {(() => {
            const d = new Date(eventDate);
            const dd = String(d.getDate()).padStart(2, "0");
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const yyyy = d.getFullYear();
            return `${dd}.${mm}.${yyyy}`;
          })()}
        </p>

        {/* Groom & Bride Names */}
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
          style={{
            fontFamily: "var(--font-caveat)",
            color: COLORS.accent,
          }}
        >
          {invitation.groomName}
          <span className="block text-2xl md:text-3xl font-normal my-1" style={{ color: COLORS.accentDark }}>
            &amp;
          </span>
          {invitation.brideName}
        </h1>

        {/* Couple Illustration with event date */}
        <div className="my-4 md:my-6">
          <CoupleIllustration eventDate={eventDate} />
        </div>

        {/* Conditional Guest Name Display */}
        {guestName && guestName.trim() !== "" && (
          <div className="mb-4 md:mb-6">
            <p
              className="text-lg md:text-xl"
              style={{
                fontFamily: "var(--font-patrick-hand)",
                color: COLORS.textLight,
              }}
            >
              Kepada,
            </p>
            <p
              className="text-xl md:text-2xl font-bold"
              style={{
                fontFamily: "var(--font-caveat)",
                color: COLORS.text,
              }}
            >
              {guestName}
            </p>
          </div>
        )}

        {/* "Open Invitation" Button with wavy/sketchy border */}
        <button
          onClick={onOpen}
          className="relative mt-2 px-8 py-3 md:px-10 md:py-4 text-white font-medium text-base md:text-lg rounded-md cursor-pointer min-w-[180px] min-h-[48px] transition-transform hover:scale-105 active:scale-95"
          style={{
            fontFamily: "var(--font-patrick-hand)",
            backgroundColor: COLORS.accent,
          }}
        >
          {/* Wavy/sketchy border overlay SVG */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 200 60"
            preserveAspectRatio="none"
            aria-hidden="true"
            role="presentation"
          >
            <rect
              x="2"
              y="2"
              width="196"
              height="56"
              rx="8"
              ry="8"
              fill="none"
              stroke={COLORS.white}
              strokeWidth="2"
              strokeDasharray="6 3"
              strokeLinecap="round"
              style={{
                filter: "url(#wavyFilter)",
              }}
            />
            <defs>
              <filter id="wavyFilter">
                <feTurbulence
                  type="turbulence"
                  baseFrequency="0.03"
                  numOctaves="2"
                  result="turbulence"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="turbulence"
                  scale="2"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </defs>
          </svg>
          <span className="relative z-10">Open Invitation</span>
        </button>
      </div>
    </div>
  );
}

// ═══════════ LOVE STORY TIMELINE ═══════════

/** Format a love story date in Indonesian locale (shorter format) */
function formatLoveStoryDate(dateStr: string): string {
  return dateStr;
}

/** DoodleLoveStory: vertical timeline with hand-drawn connectors */
function DoodleLoveStory({ stories }: { stories: SerializedInvitation["loveStories"] }) {
  // Sort stories by order ascending
  const sortedStories = [...stories].sort((a, b) => a.order - b.order);

  if (sortedStories.length === 0) return null;

  return (
    <section className="py-16 md:py-20 px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        {/* Section heading */}
        <div className="flex items-center justify-center gap-2 mb-10 md:mb-14">
          <DoodleHeart className="opacity-60" />
          <h2
            className="text-3xl md:text-4xl font-bold text-center"
            style={{ fontFamily: "var(--font-caveat)", color: COLORS.accentDark }}
          >
            Cerita Cinta
          </h2>
          <DoodleHeart className="opacity-60" />
        </div>

        {/* Timeline container */}
        <div className="relative">
          {/* Vertical connector line (hand-drawn dashed style) */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 md:-translate-x-[0.5px]">
            <svg
              className="w-[3px] h-full"
              preserveAspectRatio="none"
              viewBox="0 0 3 100"
              {...decorationProps}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              strokeLinecap="round"
            >
              <path d="M1.5 0 Q2.5 25, 1 50 Q0 75, 1.5 100" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>

          {/* Story items */}
          <div className="space-y-8 md:space-y-12">
            {sortedStories.map((story, index) => {
              const isLeft = index % 2 === 0;

              return (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative flex items-start gap-4 md:gap-0 ${
                    // Mobile: always left-aligned; Desktop: alternate
                    "pl-10 md:pl-0"
                  }`}
                >
                  {/* Circle marker - mobile (always left) */}
                  <div className="absolute left-[9px] top-2 md:hidden">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      {...decorationProps}
                      strokeWidth={2}
                    >
                      <circle cx="7" cy="7" r="5.5" fill={COLORS.accent} stroke={COLORS.accent} />
                    </svg>
                  </div>

                  {/* Desktop layout: alternate left/right */}
                  {/* Left card (even index) */}
                  <div
                    className={`hidden md:block md:w-[calc(50%-24px)] ${
                      isLeft ? "md:pr-4 md:text-right" : ""
                    }`}
                  >
                    {isLeft && (
                      <div className="p-4 rounded-lg border-2 border-dashed" style={{ borderColor: COLORS.accent + "40" }}>
                        {story.imageUrl && (
                          <div className="flex justify-center mb-3">
                            <img
                              src={story.imageUrl}
                              alt={story.title}
                              className="w-32 h-32 md:w-40 md:h-40 rounded-lg object-cover"
                            />
                          </div>
                        )}
                        <h3
                          className="text-xl md:text-2xl font-bold"
                          style={{ fontFamily: "var(--font-caveat)", color: COLORS.accentDark }}
                        >
                          {story.title}
                        </h3>
                        {story.date && (
                          <p
                            className="text-sm mt-1"
                            style={{ fontFamily: "var(--font-patrick-hand)", color: COLORS.accent }}
                          >
                            {formatLoveStoryDate(story.date)}
                          </p>
                        )}
                        <p
                          className="text-sm md:text-base mt-2 leading-relaxed"
                          style={{ color: COLORS.text }}
                        >
                          {story.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Center circle marker - desktop */}
                  <div className="hidden md:flex md:items-center md:justify-center md:w-12 md:flex-shrink-0 relative">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      className="relative z-10"
                      {...decorationProps}
                      strokeWidth={2}
                    >
                      <circle cx="7" cy="7" r="5.5" fill={COLORS.accent} stroke={COLORS.accent} />
                    </svg>
                  </div>

                  {/* Right card (odd index) */}
                  <div
                    className={`hidden md:block md:w-[calc(50%-24px)] ${
                      !isLeft ? "md:pl-4 md:text-left" : ""
                    }`}
                  >
                    {!isLeft && (
                      <div className="p-4 rounded-lg border-2 border-dashed" style={{ borderColor: COLORS.accent + "40" }}>
                        {story.imageUrl && (
                          <div className="flex justify-center mb-3">
                            <img
                              src={story.imageUrl}
                              alt={story.title}
                              className="w-32 h-32 md:w-40 md:h-40 rounded-lg object-cover"
                            />
                          </div>
                        )}
                        <h3
                          className="text-xl md:text-2xl font-bold"
                          style={{ fontFamily: "var(--font-caveat)", color: COLORS.accentDark }}
                        >
                          {story.title}
                        </h3>
                        {story.date && (
                          <p
                            className="text-sm mt-1"
                            style={{ fontFamily: "var(--font-patrick-hand)", color: COLORS.accent }}
                          >
                            {formatLoveStoryDate(story.date)}
                          </p>
                        )}
                        <p
                          className="text-sm md:text-base mt-2 leading-relaxed"
                          style={{ color: COLORS.text }}
                        >
                          {story.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Mobile card (always shown on mobile, hidden on desktop) */}
                  <div className="md:hidden flex-1">
                    <div className="p-4 rounded-lg border-2 border-dashed" style={{ borderColor: COLORS.accent + "40" }}>
                      {story.imageUrl && (
                        <div className="flex justify-center mb-3">
                          <img
                            src={story.imageUrl}
                            alt={story.title}
                            className="w-32 h-32 rounded-lg object-cover"
                          />
                        </div>
                      )}
                      <h3
                        className="text-xl font-bold"
                        style={{ fontFamily: "var(--font-caveat)", color: COLORS.accentDark }}
                      >
                        {story.title}
                      </h3>
                      {story.date && (
                        <p
                          className="text-sm mt-1"
                          style={{ fontFamily: "var(--font-patrick-hand)", color: COLORS.accent }}
                        >
                          {formatLoveStoryDate(story.date)}
                        </p>
                      )}
                      <p
                        className="text-sm mt-2 leading-relaxed"
                        style={{ color: COLORS.text }}
                      >
                        {story.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Leaf doodle accents at bottom */}
        <div className="flex justify-center mt-8 gap-4 opacity-40">
          <LeafDoodle className="rotate-[-15deg]" />
          <LeafDoodle className="rotate-[15deg] scale-x-[-1]" />
        </div>
      </motion.div>
    </section>
  );
}

// ═══════════ MAIN COMPONENT ═══════════
export default function DoodleTemplate({ invitation, guestName }: DoodleTemplateProps) {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <div className={`${caveat.variable} ${patrickHand.variable}`}>
      <AnimatePresence mode="wait">
        {!isOpened ? (
          <motion.div
            key="opening"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <DoodleOpeningScreen
              invitation={invitation}
              guestName={guestName}
              onOpen={() => setIsOpened(true)}
            />
          </motion.div>
        ) : (
          <motion.main
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen overflow-x-hidden"
            style={{ backgroundColor: COLORS.background }}
          >
            {/* ═══════════ QUOTE / AYAT SECTION ═══════════ */}
            {(invitation.quoteArabic || invitation.quoteText || invitation.quoteSource) && (
              <section className="py-16 md:py-20 px-4 md:px-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="max-w-2xl mx-auto text-center relative"
                >
                  {/* LeafDoodle accents */}
                  <LeafDoodle className="absolute -top-2 -left-2 md:left-4 opacity-50 -rotate-12 pointer-events-none" />
                  <LeafDoodle className="absolute -top-2 -right-2 md:right-4 opacity-50 rotate-12 scale-x-[-1] pointer-events-none" />

                  {/* Section heading with DoodleHeart accents */}
                  <div className="flex items-center justify-center gap-2 mb-6 md:mb-8">
                    <DoodleHeart className="opacity-70" />
                    <h2
                      className="text-2xl md:text-3xl font-bold"
                      style={{
                        fontFamily: "var(--font-caveat)",
                        color: COLORS.accentDark,
                      }}
                    >
                      Ayat Suci
                    </h2>
                    <DoodleHeart className="opacity-70" />
                  </div>

                  {/* Arabic text (RTL) */}
                  {invitation.quoteArabic && (
                    <p
                      dir="rtl"
                      className="text-2xl md:text-3xl leading-loose mb-6"
                      style={{
                        color: COLORS.text,
                        fontFamily: "serif",
                      }}
                    >
                      {invitation.quoteArabic}
                    </p>
                  )}

                  {/* Quote text (translation) */}
                  {invitation.quoteText && (
                    <p
                      className="text-base md:text-lg leading-relaxed mb-4"
                      style={{
                        fontFamily: "var(--font-patrick-hand)",
                        color: COLORS.text,
                      }}
                    >
                      &ldquo;{invitation.quoteText}&rdquo;
                    </p>
                  )}

                  {/* Quote source */}
                  {invitation.quoteSource && (
                    <p
                      className="text-sm md:text-base font-bold tracking-wide"
                      style={{
                        fontFamily: "var(--font-caveat)",
                        color: COLORS.accent,
                      }}
                    >
                      — {invitation.quoteSource}
                    </p>
                  )}

                  {/* Bottom LeafDoodle accent */}
                  <div className="flex justify-center mt-6">
                    <LeafDoodle className="opacity-40 rotate-180" />
                  </div>
                </motion.div>
              </section>
            )}

            <DoodleDivider />

            {/* ═══════════ EVENTS SECTION ═══════════ */}
            {(invitation.akadDate || invitation.resepsiDate) && (
              <DoodleEvents invitation={invitation} />
            )}

            <DoodleDivider />

            {/* ═══════════ COUNTDOWN SECTION ═══════════ */}
            <DoodleCountdown
              eventDate={invitation.akadDate || invitation.resepsiDate || invitation.eventDate}
            />

            <DoodleDivider />

            {/* ═══════════ COUPLE PROFILES SECTION ═══════════ */}
            <section className="py-16 md:py-20 px-4 md:px-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6 }}
                className="max-w-3xl mx-auto text-center"
              >
                {/* Section heading with doodle heart accents */}
                <div className="flex items-center justify-center gap-2 mb-10 md:mb-14">
                  <DoodleHeart className="opacity-60" />
                  <h2
                    className="text-3xl md:text-4xl font-bold"
                    style={{ fontFamily: "var(--font-caveat)", color: COLORS.accentDark }}
                  >
                    Mempelai
                  </h2>
                  <DoodleHeart className="opacity-60" />
                </div>

                {/* Profiles container: flex-col on mobile, flex-row on md+ */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
                  {/* Groom Profile */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="flex flex-col items-center text-center"
                  >
                    <SketchyCircleBorder size={140} className="mb-4">
                      {invitation.groomPhoto ? (
                        <img
                          src={invitation.groomPhoto}
                          alt={invitation.groomFullName || invitation.groomName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <DoodlePlaceholder />
                      )}
                    </SketchyCircleBorder>
                    <h3
                      className="text-2xl md:text-3xl font-bold mt-2"
                      style={{ fontFamily: "var(--font-caveat)", color: COLORS.accent }}
                    >
                      {invitation.groomFullName || invitation.groomName}
                    </h3>
                    {/* Parent info: show only when at least one field is provided */}
                    {(invitation.groomChildOrder || invitation.groomFather || invitation.groomMother) && (
                      <div className="mt-2">
                        {invitation.groomChildOrder && (
                          <p
                            className="text-sm"
                            style={{ fontFamily: "var(--font-patrick-hand)", color: COLORS.text }}
                          >
                            {invitation.groomChildOrder}
                          </p>
                        )}
                        {(invitation.groomFather || invitation.groomMother) && (
                          <p
                            className="text-sm mt-1"
                            style={{ fontFamily: "var(--font-patrick-hand)", color: COLORS.textLight }}
                          >
                            {invitation.groomFather && `Bapak ${invitation.groomFather}`}
                            {invitation.groomFather && invitation.groomMother && " & "}
                            {invitation.groomMother && `Ibu ${invitation.groomMother}`}
                          </p>
                        )}
                      </div>
                    )}
                  </motion.div>

                  {/* Ampersand/Heart doodle between profiles */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <AmpersandDoodle />
                  </motion.div>

                  {/* Bride Profile */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="flex flex-col items-center text-center"
                  >
                    <SketchyCircleBorder size={140} className="mb-4">
                      {invitation.bridePhoto ? (
                        <img
                          src={invitation.bridePhoto}
                          alt={invitation.brideFullName || invitation.brideName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <DoodlePlaceholder />
                      )}
                    </SketchyCircleBorder>
                    <h3
                      className="text-2xl md:text-3xl font-bold mt-2"
                      style={{ fontFamily: "var(--font-caveat)", color: COLORS.accent }}
                    >
                      {invitation.brideFullName || invitation.brideName}
                    </h3>
                    {/* Parent info: show only when at least one field is provided */}
                    {(invitation.brideChildOrder || invitation.brideFather || invitation.brideMother) && (
                      <div className="mt-2">
                        {invitation.brideChildOrder && (
                          <p
                            className="text-sm"
                            style={{ fontFamily: "var(--font-patrick-hand)", color: COLORS.text }}
                          >
                            {invitation.brideChildOrder}
                          </p>
                        )}
                        {(invitation.brideFather || invitation.brideMother) && (
                          <p
                            className="text-sm mt-1"
                            style={{ fontFamily: "var(--font-patrick-hand)", color: COLORS.textLight }}
                          >
                            {invitation.brideFather && `Bapak ${invitation.brideFather}`}
                            {invitation.brideFather && invitation.brideMother && " & "}
                            {invitation.brideMother && `Ibu ${invitation.brideMother}`}
                          </p>
                        )}
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Leaf doodle accents at bottom */}
                <div className="flex justify-center mt-8 gap-4 opacity-40">
                  <LeafDoodle className="rotate-[-15deg]" />
                  <LeafDoodle className="rotate-[15deg] scale-x-[-1]" />
                </div>
              </motion.div>
            </section>

            <DoodleDivider />

            {/* ═══════════ GALLERY SECTION ═══════════ */}
            {invitation.gallery && invitation.gallery.length > 0 && (
              <>
                <DoodleGallery gallery={invitation.gallery} />
                <DoodleDivider />
              </>
            )}

            {/* ═══════════ LOVE STORY SECTION ═══════════ */}
            {invitation.loveStories && invitation.loveStories.length > 0 && (
              <>
                <DoodleLoveStory stories={invitation.loveStories} />
                <DoodleDivider />
              </>
            )}

            {/* ═══════════ GIFT SECTION ═══════════ */}
            {invitation.giftAccounts && invitation.giftAccounts.length > 0 && (
              <>
                <DoodleGift invitation={invitation} />
                <DoodleDivider />
              </>
            )}

            {/* ═══════════ COMMENTS SECTION ═══════════ */}
            <DoodleComments invitationId={invitation.id} comments={invitation.comments} />

            <DoodleDivider />

            {/* ═══════════ SHARE & FOOTER SECTION ═══════════ */}
            <DoodleShareFooter invitation={invitation} />

            {/* ═══════════ MUSIC PLAYER ═══════════ */}
            {invitation.musicUrl && (
              <MusicPlayer musicUrl={invitation.musicUrl} autoPlay={true} accentColor="#047857" borderColor="#047857" hoverBorderColor="#065F46" />
            )}
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
