"use client";

import { motion } from "framer-motion";

interface OpeningScreenProps {
  groomName: string;
  brideName: string;
  eventDate: string;
  hashtag?: string | null;
  guestName?: string | null;
  onOpen: () => void;
}

export default function OpeningScreen({
  groomName,
  brideName,
  eventDate,
  hashtag,
  guestName,
  onOpen,
}: OpeningScreenProps) {
  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-rose-50 via-amber-50/50 to-rose-50 px-4 text-center overflow-hidden invitation-bg-pattern">
      <div className="max-w-md mx-auto">
        {/* Top ornament */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-amber-600/40 text-2xl mb-6"
          aria-hidden="true"
        >
          ❧
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-sm uppercase tracking-widest text-amber-700 mb-6 font-serif"
        >
          Undangan Pernikahan
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-4xl md:text-5xl font-serif text-gray-800 mb-2"
        >
          {groomName}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-2xl text-amber-600 font-serif mb-2"
        >
          &amp;
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="text-4xl md:text-5xl font-serif text-gray-800 mb-8"
        >
          {brideName}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          className="text-gray-600 mb-2 font-light"
        >
          {formattedDate}
        </motion.p>

        {hashtag && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 2.0 }}
            className="text-gray-500 text-sm mb-8"
          >
            {hashtag}
          </motion.p>
        )}

        {!hashtag && !guestName && <div className="mb-8" />}

        {guestName && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 2.0 }}
            className="mb-8"
          >
            <p className="text-xs tracking-widest text-gray-400 mb-1">Dear,</p>
            <p className="text-lg font-serif text-gray-700">{guestName}</p>
          </motion.div>
        )}

        {!guestName && !hashtag && <div className="mb-8" />}

        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 2.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpen}
          className="px-8 py-3 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors font-medium shadow-lg shadow-amber-600/20"
        >
          Buka Undangan
        </motion.button>

        {/* Bottom ornament */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.6 }}
          className="text-amber-600/30 text-sm mt-10 tracking-[0.5em]"
          aria-hidden="true"
        >
          ✦ ✦ ✦
        </motion.p>
      </div>
    </section>
  );
}
