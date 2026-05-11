"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SerializedGiftAccount } from "@/app/invitation/[slug]/InvitationClient";

interface GiftAccountsProps {
  accounts: SerializedGiftAccount[];
}

export default function GiftAccounts({ accounts }: GiftAccountsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (accounts.length === 0) return null;

  const copyToClipboard = (accountNumber: string, id: string) => {
    navigator.clipboard.writeText(accountNumber).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
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
          Hadiah Digital
        </motion.h3>

        <div className="space-y-4">
          {accounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-lg p-5 shadow-sm border border-amber-100/50"
            >
              <p className="font-medium text-gray-800">{account.bankName}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <p className="text-lg font-mono text-gray-700">
                  {account.accountNumber}
                </p>
                <button
                  onClick={() =>
                    copyToClipboard(account.accountNumber, account.id)
                  }
                  className="px-3 py-1 text-xs bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition-colors"
                  aria-label={`Copy nomor rekening ${account.accountNumber}`}
                >
                  {copiedId === account.id ? "Tersalin!" : "Salin"}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                a.n. {account.accountHolder}
              </p>

              {account.qrisUrl && (
                <div className="mt-3">
                  <img
                    src={account.qrisUrl}
                    alt={`QRIS ${account.bankName}`}
                    className="mx-auto max-w-[200px] rounded-md"
                    loading="lazy"
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
