"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface MusicPlayerProps {
  musicUrl: string;
  autoPlay?: boolean;
}

export default function MusicPlayer({ musicUrl, autoPlay = true }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(musicUrl);
    audio.loop = true;
    audio.preload = "auto";
    audioRef.current = audio;

    // Autoplay when component mounts (after user clicks "Buka Undangan")
    if (autoPlay) {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Browser blocked autoplay — user will need to click play
        setIsPlaying(false);
      });
    }

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [musicUrl, autoPlay]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Autoplay blocked by browser - user needs to interact first
        setIsPlaying(false);
      });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={togglePlay}
        className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border border-amber-200 hover:border-amber-400 transition-colors"
        aria-label={isPlaying ? "Pause musik" : "Play musik"}
      >
        {isPlaying ? (
          <motion.div
            className="flex items-center gap-[2px]"
            aria-hidden="true"
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-[3px] bg-amber-600 rounded-full"
                animate={{
                  height: ["8px", "16px", "8px"],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        ) : (
          <span className="text-amber-600 text-lg ml-0.5">▶</span>
        )}
      </motion.button>
    </div>
  );
}
