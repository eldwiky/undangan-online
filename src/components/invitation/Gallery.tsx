"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SerializedGallery } from "@/app/invitation/[slug]/InvitationClient";

interface GalleryProps {
  photos: SerializedGallery[];
}

export default function Gallery({ photos }: GalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<SerializedGallery | null>(
    null
  );

  if (photos.length === 0) return null;

  return (
    <section className="py-14 px-4 text-center bg-white/40 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-xl font-serif text-gray-800 mb-8"
        >
          Galeri
        </motion.h3>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4"
        >
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="aspect-square rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 border border-amber-100/50"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={photo.imageUrl}
                alt={`Gallery photo ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.imageUrl}
                alt="Gallery preview"
                className="w-full h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-2 right-2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-800 hover:bg-white transition-colors shadow-lg"
                aria-label="Tutup preview"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
