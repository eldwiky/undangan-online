"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SerializedComment } from "@/app/(public)/[slug]/InvitationClient";

interface CommentsProps {
  invitationId: string;
  comments: SerializedComment[];
}

interface CommentForm {
  guestName: string;
  message: string;
  attendance: "hadir" | "tidak_hadir" | "ragu";
}

interface FormErrors {
  guestName?: string;
  message?: string;
}

export default function Comments({
  invitationId,
  comments: initialComments,
}: CommentsProps) {
  const [comments, setComments] = useState<SerializedComment[]>(initialComments);
  const [visibleCount, setVisibleCount] = useState(5);
  const [form, setForm] = useState<CommentForm>({
    guestName: "",
    message: "",
    attendance: "hadir",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto-poll comments every 5 seconds for near real-time updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/invitations/${invitationId}/comments?page=1&_t=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            setComments(json.data);
          }
        }
      } catch {
        // Silent fail - don't disrupt UX
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [invitationId]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.guestName.trim()) {
      newErrors.guestName = "Nama wajib diisi";
    }
    if (!form.message.trim()) {
      newErrors.message = "Pesan wajib diisi";
    } else if (form.message.length > 500) {
      newErrors.message = "Pesan maksimal 500 karakter";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(false);
    setSubmitError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/invitations/${invitationId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal mengirim ucapan");
      }

      const data = await res.json();
      setComments((prev) => [data.data, ...prev]);
      setForm({ guestName: "", message: "", attendance: "hadir" });
      setErrors({});
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Terjadi kesalahan"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const visibleComments = comments.slice(0, visibleCount);
  const hasMore = visibleCount < comments.length;

  return (
    <section className="py-14 px-4 text-center bg-white/40 backdrop-blur-sm">
      <div className="max-w-md mx-auto">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-xl font-serif text-gray-800 mb-8"
        >
          Ucapan &amp; Doa
        </motion.h3>

        {/* Comment Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-sm rounded-lg p-5 shadow-sm mb-6 text-left border border-amber-100/50"
        >
          <div className="mb-3">
            <label
              htmlFor="guestName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nama
            </label>
            <input
              id="guestName"
              type="text"
              value={form.guestName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, guestName: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Nama Anda"
              maxLength={100}
            />
            {errors.guestName && (
              <p className="text-xs text-red-500 mt-1">{errors.guestName}</p>
            )}
          </div>

          <div className="mb-3">
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Ucapan
            </label>
            <textarea
              id="message"
              value={form.message}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, message: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Tulis ucapan & doa..."
              maxLength={500}
            />
            {errors.message && (
              <p className="text-xs text-red-500 mt-1">{errors.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="attendance"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Kehadiran
            </label>
            <select
              id="attendance"
              value={form.attendance}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  attendance: e.target.value as CommentForm["attendance"],
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="hadir">Hadir</option>
              <option value="tidak_hadir">Tidak Hadir</option>
              <option value="ragu">Masih Ragu</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Mengirim..." : "Kirim Ucapan"}
          </button>

          {submitSuccess && (
            <p className="text-xs text-green-600 mt-2 text-center">
              Ucapan berhasil dikirim!
            </p>
          )}
          {submitError && (
            <p className="text-xs text-red-500 mt-2 text-center">
              {submitError}
            </p>
          )}
        </motion.form>

        {/* Comments List */}
        {visibleComments.length > 0 ? (
          <div className="space-y-4 text-left">
            {visibleComments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-amber-100/50"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-gray-800 text-sm">
                    {comment.guestName}
                  </p>
                  <span className="text-xs text-amber-600 capitalize">
                    {comment.attendance === "hadir"
                      ? "✓ Hadir"
                      : comment.attendance === "tidak_hadir"
                        ? "✗ Tidak Hadir"
                        : "? Ragu"}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{comment.message}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(comment.createdAt).toLocaleDateString("id-ID")}
                </p>
              </motion.div>
            ))}

            {hasMore && (
              <button
                onClick={() => setVisibleCount((prev) => prev + 5)}
                className="w-full py-2 text-sm text-amber-700 hover:text-amber-800 transition-colors"
              >
                Lihat lebih banyak ({comments.length - visibleCount} lagi)
              </button>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Belum ada ucapan</p>
        )}
      </div>
    </section>
  );
}

