"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { Invitation } from "@/types";

interface CreateFormData {
  groomName: string;
  brideName: string;
  eventDate: string;
}

const templateConfig: Record<string, { label: string; color: string; dot: string; border: string; badge: string }> = {
  spotify: {
    label: "Spotify",
    color: "text-green-700",
    dot: "bg-green-500",
    border: "border-l-green-500",
    badge: "bg-green-50 text-green-700 ring-green-600/20",
  },
  elegant: {
    label: "Elegant",
    color: "text-amber-700",
    dot: "bg-amber-500",
    border: "border-l-amber-500",
    badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  floral: {
    label: "Floral",
    color: "text-purple-700",
    dot: "bg-purple-500",
    border: "border-l-purple-500",
    badge: "bg-purple-50 text-purple-700 ring-purple-600/20",
  },
};

function getTemplateStyle(template: string) {
  return templateConfig[template] || templateConfig.elegant;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormData>({
    groomName: "",
    brideName: "",
    eventDate: "",
  });
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/invitations");
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Gagal memuat data");
      }
      const json = await res.json();
      setInvitations(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groomName: createForm.groomName,
          brideName: createForm.brideName,
          eventDate: new Date(createForm.eventDate).toISOString(),
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Gagal membuat undangan");
      }

      setShowCreateModal(false);
      setCreateForm({ groomName: "", brideName: "", eventDate: "" });
      showNotification("Undangan berhasil dibuat!");
      await fetchInvitations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat undangan");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${title}"? Semua data terkait akan ikut terhapus.`)) {
      return;
    }

    setDeleting(id);
    try {
      const res = await fetch(`/api/invitations/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Gagal menghapus undangan");
      }

      showNotification("Undangan berhasil dihapus");
      await fetchInvitations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus undangan");
    } finally {
      setDeleting(null);
    }
  };

  const handleCopyLink = async (slug: string) => {
    const url = `${window.location.origin}/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      showNotification("Link berhasil disalin ke clipboard!");
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      showNotification("Link berhasil disalin ke clipboard!");
    }
  };

  const handlePreview = (slug: string) => {
    window.open(`/${slug}`, "_blank");
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const userName = session?.user?.name || "User";

  return (
    <div>
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-lg shadow-green-200/50 animate-fade-in">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{notification}</span>
        </div>
      )}

      {/* Welcome Header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Selamat datang, {userName}! 👋
            </h2>
            <p className="text-gray-500 mt-1.5 text-base">
              Kelola undangan pernikahan digital Anda
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="group relative inline-flex items-center px-5 py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-xl hover:from-rose-600 hover:to-amber-600 transition-all duration-300 font-semibold shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/50 hover:-translate-y-0.5 cursor-pointer overflow-hidden"
          >
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 animate-shimmer transition-opacity duration-300"></span>
            <svg className="relative w-5 h-5 mr-2 transition-transform group-hover:rotate-90 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="relative">Buat Undangan Baru</span>
          </button>
        </div>

        {/* Stats Card */}
        {!loading && (
          <div className="mt-6 inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-xl px-5 py-3 shadow-sm opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{invitations.length}</p>
              <p className="text-xs text-gray-500 -mt-0.5">Total Undangan</p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-medium text-sm cursor-pointer">
            Tutup
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-rose-100 border-t-rose-500 animate-spin"></div>
          </div>
          <span className="mt-4 text-gray-500 font-medium">Memuat undangan...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && invitations.length === 0 && (
        <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm animate-fade-in-up">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Belum ada undangan</h3>
          <p className="mt-2 text-gray-500 max-w-sm mx-auto">
            Mulai buat undangan pernikahan digital pertama Anda dan bagikan momen bahagia kepada orang-orang tercinta
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-8 inline-flex items-center px-6 py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-xl hover:from-rose-600 hover:to-amber-600 transition-all duration-300 font-semibold shadow-lg shadow-rose-200/50 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Buat Undangan Pertama
          </button>
        </div>
      )}

      {/* Invitation List */}
      {!loading && invitations.length > 0 && (
        <div className="grid gap-4">
          {invitations.map((invitation, index) => {
            const tpl = getTemplateStyle(invitation.template || "elegant");
            return (
              <div
                key={invitation.id}
                className={`group bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 border-l-4 ${tpl.border} p-5 sm:p-6 hover:shadow-lg hover:shadow-gray-100/80 hover:-translate-y-0.5 transition-all duration-300 opacity-0 animate-fade-in-up`}
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Left side - Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${tpl.dot}`}></div>
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {invitation.title}
                      </h3>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 ml-5">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(invitation.eventDate)}
                      </span>
                      <span className="flex items-center gap-1.5 cursor-pointer hover:text-rose-600 transition-colors" onClick={() => handlePreview(invitation.slug)}>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="truncate max-w-[200px]">/{invitation.slug}</span>
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${tpl.badge}`}>
                        {tpl.label}
                      </span>
                    </div>
                  </div>

                  {/* Right side - Action Buttons */}
                  <div className="flex items-center gap-1.5 ml-5 sm:ml-0">
                    {/* Edit */}
                    <button
                      onClick={() => router.push(`/dashboard/${invitation.id}/edit`)}
                      className="relative p-2.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-all duration-200 cursor-pointer group/btn"
                      title="Edit undangan"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Edit
                      </span>
                    </button>

                    {/* Preview */}
                    <button
                      onClick={() => handlePreview(invitation.slug)}
                      className="relative p-2.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-all duration-200 cursor-pointer group/btn"
                      title="Preview undangan"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Preview
                      </span>
                    </button>

                    {/* Copy Link */}
                    <button
                      onClick={() => handleCopyLink(invitation.slug)}
                      className="relative p-2.5 rounded-lg text-green-600 hover:bg-green-50 transition-all duration-200 cursor-pointer group/btn"
                      title="Salin link"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Copy Link
                      </span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(invitation.id, invitation.title)}
                      disabled={deleting === invitation.id}
                      className="relative p-2.5 rounded-lg text-red-500 hover:bg-red-50 transition-all duration-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed group/btn"
                      title="Hapus undangan"
                    >
                      {deleting === invitation.id ? (
                        <div className="w-4.5 h-4.5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Hapus
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-rose-500 to-amber-500 px-6 py-5">
              <h3 className="text-lg font-bold text-white">
                ✨ Buat Undangan Baru
              </h3>
              <p className="text-rose-100 text-sm mt-0.5">
                Isi detail mempelai untuk memulai
              </p>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label htmlFor="groomName" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nama Mempelai Pria
                </label>
                <input
                  id="groomName"
                  type="text"
                  required
                  value={createForm.groomName}
                  onChange={(e) => setCreateForm({ ...createForm, groomName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 outline-none transition-all duration-200 bg-gray-50/50 hover:bg-white"
                  placeholder="Contoh: Ahmad"
                />
              </div>
              <div>
                <label htmlFor="brideName" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nama Mempelai Wanita
                </label>
                <input
                  id="brideName"
                  type="text"
                  required
                  value={createForm.brideName}
                  onChange={(e) => setCreateForm({ ...createForm, brideName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 outline-none transition-all duration-200 bg-gray-50/50 hover:bg-white"
                  placeholder="Contoh: Fatimah"
                />
              </div>
              <div>
                <label htmlFor="eventDate" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Tanggal Acara
                </label>
                <input
                  id="eventDate"
                  type="date"
                  required
                  value={createForm.eventDate}
                  onChange={(e) => setCreateForm({ ...createForm, eventDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 outline-none transition-all duration-200 bg-gray-50/50 hover:bg-white"
                />
              </div>
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-xl hover:from-rose-600 hover:to-amber-600 transition-all duration-200 font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shadow-md shadow-rose-200/50"
                >
                  {creating ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Membuat...
                    </span>
                  ) : (
                    "Buat Undangan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
