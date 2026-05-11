"use client";

import { motion } from "framer-motion";

interface LocationMapProps {
  locationName: string | null;
  location: string | null;
  mapsUrl: string | null;
}

export default function LocationMap({
  locationName,
  location,
  mapsUrl,
}: LocationMapProps) {
  if (!location && !mapsUrl) return null;

  // Extract embed URL from Google Maps URL for iframe
  const getEmbedUrl = (url: string): string => {
    // If it's already an embed URL, use as-is
    if (url.includes("/embed")) return url;
    // Convert regular Google Maps URL to embed format
    const encoded = encodeURIComponent(url);
    return `https://www.google.com/maps?q=${encoded}&output=embed`;
  };

  return (
    <section className="py-14 px-4 text-center">
      <div className="max-w-2xl mx-auto">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-xl font-serif text-gray-800 mb-6"
        >
          Lokasi Acara
        </motion.h3>

        {locationName && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-medium text-gray-700 mb-2"
          >
            {locationName}
          </motion.p>
        )}

        {location && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-600 mb-4"
          >
            {location}
          </motion.p>
        )}

        {mapsUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-4"
          >
            <div className="rounded-lg overflow-hidden shadow-md border border-amber-100/50">
              <iframe
                src={getEmbedUrl(mapsUrl)}
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi Acara"
              />
            </div>
          </motion.div>
        )}

        {mapsUrl && (
          <motion.a
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors text-sm"
          >
            Buka Maps
          </motion.a>
        )}
      </div>
    </section>
  );
}
