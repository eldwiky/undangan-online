"use client";

import { motion } from "framer-motion";

interface SectionDividerProps {
  variant?: "floral" | "line" | "ornament";
}

export default function SectionDivider({ variant = "floral" }: SectionDividerProps) {
  if (variant === "line") {
    return (
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="flex items-center justify-center py-4 px-8"
      >
        <div className="h-px w-full max-w-xs bg-gradient-to-r from-transparent via-amber-600/40 to-transparent" />
      </motion.div>
    );
  }

  if (variant === "ornament") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-center py-6 px-4"
      >
        <span className="text-amber-600/50 text-sm tracking-[0.5em]">✦ ✦ ✦</span>
      </motion.div>
    );
  }

  // Default: floral
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="section-divider"
    >
      <span className="section-divider-icon" aria-hidden="true">❦</span>
    </motion.div>
  );
}
