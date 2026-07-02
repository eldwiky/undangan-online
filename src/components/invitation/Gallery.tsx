"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SerializedGallery } from "@/app/(public)/[slug]/InvitationClient";

interface GalleryProps {
  photos: SerializedGallery[];
}

export default function Gallery({ photos }: GalleryProps) {
  const sorted = [...photos].sort((a, b) => a.order - b.order);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  if (sorted.length === 0) return null;

  const goTo = useCallback(
    (index: number, dir: 1 | -1) => {
      setDirection(dir);
      setCurrent(index);
    },
    []
  );

  const prev = () => {
    const idx = (current - 1 + sorted.length) % sorted.length;
    goTo(idx, -1);
  };

  const next = () => {
    const idx = (current + 1) % sorted.length;
    goTo(idx, 1);
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "60%" : "-60%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-60%" : "60%",
      opacity: 0,
    }),
  };

  return (
    <section className="py-14 px-4 text-center bg-white/40 backdrop-blur-sm">
      <div className="max-w-sm mx-auto">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-xl font-serif text-gray-800 mb-8"
        >
          Galeri
        </motion.h3>

        {/* Carousel container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          {/* Emerald green rounded border frame */}
          <div className="relative rounded-3xl overflow-hidden border-4 border-emerald-500 shadow-xl bg-black aspect-[3/4]">
            <AnimatePresence custom={direction} initial={false} mode="popLayout">
              <motion.img
                key={sorted[current].id}
                src={sorted[current].imageUrl}
                alt={`Foto ${current + 1}`}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
            </AnimatePresence>

            {/* Prev button */}
            {sorted.length > 1 && (
              <>
                <button
                  onClick={prev}
                  aria-label="Foto sebelumnya"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>

                {/* Next button */}
                <button
                  onClick={next}
                  aria-label="Foto selanjutnya"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Dot indicators */}
          {sorted.length > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              {sorted.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Foto ${i + 1}`}
                  onClick={() => goTo(i, i > current ? 1 : -1)}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-6 h-2.5 bg-emerald-600"
                      : "w-2.5 h-2.5 bg-gray-300 hover:bg-emerald-300"
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
