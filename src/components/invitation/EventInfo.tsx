"use client";

import { motion } from "framer-motion";

interface EventInfoProps {
  groomName: string;
  brideName: string;
  description: string | null;
  eventDate: string;
  eventTime: string | null;
}

export default function EventInfo({
  groomName,
  brideName,
  description,
  eventDate,
  eventTime,
}: EventInfoProps) {
  const formattedDate = new Date(eventDate).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="py-16 px-4 text-center">
      <div className="max-w-2xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-sm uppercase tracking-widest text-amber-700 mb-6 font-serif"
        >
          Undangan Pernikahan
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-4xl font-serif text-gray-800 mb-2"
        >
          {groomName}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-xl text-amber-600 font-serif mb-2"
        >
          &amp;
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-3xl md:text-4xl font-serif text-gray-800 mb-8"
        >
          {brideName}
        </motion.h2>

        {description && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto"
          >
            {description}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-gray-700"
        >
          <p className="font-medium font-serif">{formattedDate}</p>
          {eventTime && <p className="mt-1 text-gray-500">Pukul {eventTime}</p>}
        </motion.div>
      </div>
    </section>
  );
}
