"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { calculateCountdown } from "@/lib/utils";

interface CountdownProps {
  eventDate: string;
}

export default function Countdown({ eventDate }: CountdownProps) {
  const [countdown, setCountdown] = useState(() =>
    calculateCountdown(new Date(eventDate))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(calculateCountdown(new Date(eventDate)));
    }, 1000);
    return () => clearInterval(interval);
  }, [eventDate]);

  if (countdown.isPast) {
    return (
      <section className="py-14 px-4 text-center bg-white/40 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-xl font-serif text-gray-800 mb-6"
          >
            Menghitung Hari
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-600 italic font-serif"
          >
            Acara telah berlangsung
          </motion.p>
        </div>
      </section>
    );
  }

  const timeUnits = [
    { value: countdown.days, label: "Hari" },
    { value: countdown.hours, label: "Jam" },
    { value: countdown.minutes, label: "Menit" },
    { value: countdown.seconds, label: "Detik" },
  ];

  return (
    <section className="py-14 px-4 text-center bg-white/40 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-xl font-serif text-gray-800 mb-8"
        >
          Menghitung Hari
        </motion.h3>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center gap-3 sm:gap-6"
        >
          {timeUnits.map((unit) => (
            <div
              key={unit.label}
              className="text-center bg-white/70 rounded-lg px-4 py-3 shadow-sm border border-amber-100 min-w-[4rem]"
            >
              <div className="text-2xl sm:text-3xl font-bold text-amber-700 font-serif">
                {unit.value}
              </div>
              <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                {unit.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
