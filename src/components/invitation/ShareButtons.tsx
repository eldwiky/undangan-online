"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface ShareButtonsProps {
  groomName: string;
  brideName: string;
}

export default function ShareButtons({
  groomName,
  brideName,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getUrl = () => {
    if (typeof window !== "undefined") return window.location.href;
    return "";
  };

  const shareText = `Undangan Pernikahan ${groomName} & ${brideName}`;

  const copyLink = () => {
    const url = getUrl();
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareWhatsApp = () => {
    const url = getUrl();
    const message = `${shareText}: ${url}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const shareTelegram = () => {
    const url = getUrl();
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <section className="py-14 px-4 text-center">
      <div className="max-w-md mx-auto">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-xl font-serif text-gray-800 mb-8"
        >
          Bagikan Undangan
        </motion.h3>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3"
        >
          <button
            onClick={copyLink}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm"
          >
            {copied ? "Tersalin!" : "Copy Link"}
          </button>

          <button
            onClick={shareWhatsApp}
            className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors text-sm"
          >
            WhatsApp
          </button>

          <button
            onClick={shareTelegram}
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors text-sm"
          >
            Telegram
          </button>
        </motion.div>
      </div>
    </section>
  );
}
