"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import type { Invitation } from "@/types";

type TabKey = "info" | "ayat" | "template" | "galeri" | "musik" | "rekening" | "lovestory";

interface TabItem {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
}

interface InfoFormData {
  groomName: string;
  brideName: string;
  eventDate: string;
  eventTime: string;
  location: string;
  locationName: string;
  mapsUrl: string;
  description: string;
  hashtag: string;
  // Akad
  akadDate: string;
  akadTime: string;
  akadLocationName: string;
  akadLocation: string;
  akadMapsUrl: string;
  // Resepsi
  resepsiDate: string;
  resepsiTime: string;
  resepsiLocationName: string;
  resepsiLocation: string;
  resepsiMapsUrl: string;
}

const tabs: TabItem[] = [
  {
    key: "info",
    label: "Info Acara",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    key: "ayat",
    label: "Ayat Al-Quran",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    key: "template",
    label: "Template",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    key: "galeri",
    label: "Galeri",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    key: "musik",
    label: "Musik",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
  },
  {
    key: "rekening",
    label: "Rekening Hadiah",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    key: "lovestory",
    label: "Love Story",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
];

export default function EditInvitationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("info");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [infoForm, setInfoForm] = useState<InfoFormData>({
    groomName: "",
    brideName: "",
    eventDate: "",
    eventTime: "",
    location: "",
    locationName: "",
    mapsUrl: "",
    description: "",
    hashtag: "",
    akadDate: "",
    akadTime: "",
    akadLocationName: "",
    akadLocation: "",
    akadMapsUrl: "",
    resepsiDate: "",
    resepsiTime: "",
    resepsiLocationName: "",
    resepsiLocation: "",
    resepsiMapsUrl: "",
  });

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadInvitation() {
      try {
        setLoading(true);
        const res = await fetch(`/api/invitations/${id}`);
        if (cancelled) return;

        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          if (res.status === 404) {
            router.push("/dashboard");
            return;
          }
          throw new Error("Gagal memuat data undangan");
        }
        const json = await res.json();
        const data = json.data as Invitation;
        setInvitation(data);

        // Populate form
        const eventDateStr = data.eventDate
          ? new Date(data.eventDate).toISOString().split("T")[0]
          : "";

        setInfoForm({
          groomName: data.groomName || "",
          brideName: data.brideName || "",
          eventDate: eventDateStr,
          eventTime: data.eventTime || "",
          location: data.location || "",
          locationName: data.locationName || "",
          mapsUrl: data.mapsUrl || "",
          description: data.description || "",
          hashtag: (data as unknown as { hashtag?: string }).hashtag || "",
          akadDate: (data as unknown as { akadDate?: string }).akadDate ? new Date((data as unknown as { akadDate: string }).akadDate).toISOString().split("T")[0] : "",
          akadTime: (data as unknown as { akadTime?: string }).akadTime || "",
          akadLocationName: (data as unknown as { akadLocationName?: string }).akadLocationName || "",
          akadLocation: (data as unknown as { akadLocation?: string }).akadLocation || "",
          akadMapsUrl: (data as unknown as { akadMapsUrl?: string }).akadMapsUrl || "",
          resepsiDate: (data as unknown as { resepsiDate?: string }).resepsiDate ? new Date((data as unknown as { resepsiDate: string }).resepsiDate).toISOString().split("T")[0] : "",
          resepsiTime: (data as unknown as { resepsiTime?: string }).resepsiTime || "",
          resepsiLocationName: (data as unknown as { resepsiLocationName?: string }).resepsiLocationName || "",
          resepsiLocation: (data as unknown as { resepsiLocation?: string }).resepsiLocation || "",
          resepsiMapsUrl: (data as unknown as { resepsiMapsUrl?: string }).resepsiMapsUrl || "",
        });
      } catch (err) {
        if (!cancelled) {
          showNotification("error", err instanceof Error ? err.message : "Terjadi kesalahan");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInvitation();

    return () => {
      cancelled = true;
    };
  }, [id, router]);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        groomName: infoForm.groomName,
        brideName: infoForm.brideName,
        eventDate: new Date(infoForm.eventDate).toISOString(),
        eventTime: infoForm.eventTime || undefined,
        location: infoForm.location || undefined,
        locationName: infoForm.locationName || undefined,
        mapsUrl: infoForm.mapsUrl || undefined,
        description: infoForm.description || undefined,
        hashtag: infoForm.hashtag || undefined,
        akadDate: infoForm.akadDate ? new Date(infoForm.akadDate).toISOString() : undefined,
        akadTime: infoForm.akadTime || undefined,
        akadLocationName: infoForm.akadLocationName || undefined,
        akadLocation: infoForm.akadLocation || undefined,
        akadMapsUrl: infoForm.akadMapsUrl || undefined,
        resepsiDate: infoForm.resepsiDate ? new Date(infoForm.resepsiDate).toISOString() : undefined,
        resepsiTime: infoForm.resepsiTime || undefined,
        resepsiLocationName: infoForm.resepsiLocationName || undefined,
        resepsiLocation: infoForm.resepsiLocation || undefined,
        resepsiMapsUrl: infoForm.resepsiMapsUrl || undefined,
      };

      const res = await fetch(`/api/invitations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Gagal menyimpan perubahan");
      }

      const json = await res.json();
      setInvitation(json.data);
      showNotification("success", "Info acara berhasil disimpan!");
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
        <span className="ml-3 text-gray-600">Memuat data undangan...</span>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">Undangan tidak ditemukan</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors cursor-pointer"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white ${
            notification.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
            aria-label="Kembali ke dashboard"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Edit Undangan
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{invitation.title}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6 overflow-x-auto">
        <nav className="flex space-x-1 min-w-max" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-rose-600 text-rose-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              aria-selected={activeTab === tab.key}
              role="tab"
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        {activeTab === "info" && (
          <InfoAcaraSection
            form={infoForm}
            setForm={setInfoForm}
            onSave={handleSaveInfo}
            saving={saving}
          />
        )}
        {activeTab === "ayat" && (
          <AyatSection invitationId={id} invitation={invitation} showNotification={showNotification} />
        )}
        {activeTab === "template" && (
          <TemplateSection
            invitationId={id}
            currentTemplate={(invitation as unknown as { template?: string })?.template || "elegant"}
            onSaved={(t) => {
              setInvitation((prev) => prev ? { ...prev, template: t } as unknown as Invitation : prev);
              showNotification("success", "Template berhasil diubah!");
            }}
          />
        )}
        {activeTab === "galeri" && <GaleriSection invitationId={id} showNotification={showNotification} />}
        {activeTab === "musik" && <MusikSection invitationId={id} currentMusicUrl={invitation.musicUrl || null} showNotification={showNotification} />}
        {activeTab === "rekening" && <RekeningSection invitationId={id} showNotification={showNotification} />}
        {activeTab === "lovestory" && <LoveStorySection invitationId={id} showNotification={showNotification} />}
      </div>
    </div>
  );
}

// ============================================================
// Info Acara Section
// ============================================================

function InfoAcaraSection({
  form,
  setForm,
  onSave,
  saving,
}: {
  form: InfoFormData;
  setForm: React.Dispatch<React.SetStateAction<InfoFormData>>;
  onSave: (e: React.FormEvent) => void;
  saving: boolean;
}) {
  return (
    <form onSubmit={onSave} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="groomName" className="block text-sm font-medium text-gray-700 mb-1">
            Nama Mempelai Pria <span className="text-red-500">*</span>
          </label>
          <input
            id="groomName"
            type="text"
            required
            value={form.groomName}
            onChange={(e) => setForm({ ...form, groomName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
            placeholder="Contoh: Ahmad"
          />
        </div>
        <div>
          <label htmlFor="brideName" className="block text-sm font-medium text-gray-700 mb-1">
            Nama Mempelai Wanita <span className="text-red-500">*</span>
          </label>
          <input
            id="brideName"
            type="text"
            required
            value={form.brideName}
            onChange={(e) => setForm({ ...form, brideName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
            placeholder="Contoh: Fatimah"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Acara <span className="text-red-500">*</span>
          </label>
          <input
            id="eventDate"
            type="date"
            required
            value={form.eventDate}
            onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
          />
        </div>
        <div>
          <label htmlFor="eventTime" className="block text-sm font-medium text-gray-700 mb-1">
            Waktu Acara
          </label>
          <input
            id="eventTime"
            type="time"
            value={form.eventTime}
            onChange={(e) => setForm({ ...form, eventTime: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="locationName" className="block text-sm font-medium text-gray-700 mb-1">
          Nama Tempat
        </label>
        <input
          id="locationName"
          type="text"
          value={form.locationName}
          onChange={(e) => setForm({ ...form, locationName: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
          placeholder="Contoh: Gedung Serbaguna Mawar"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Alamat Lengkap
        </label>
        <textarea
          id="location"
          rows={2}
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none resize-none"
          placeholder="Contoh: Jl. Mawar No. 10, Jakarta Selatan"
        />
      </div>

      <div>
        <label htmlFor="mapsUrl" className="block text-sm font-medium text-gray-700 mb-1">
          Link Google Maps
        </label>
        <input
          id="mapsUrl"
          type="url"
          value={form.mapsUrl}
          onChange={(e) => setForm({ ...form, mapsUrl: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
          placeholder="https://maps.google.com/..."
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Deskripsi / Kata Sambutan
        </label>
        <textarea
          id="description"
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none resize-none"
          placeholder="Tuliskan kata sambutan atau deskripsi acara..."
        />
      </div>

      {/* === AKAD NIKAH === */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <h4 className="text-md font-semibold text-gray-800 mb-4">Akad Nikah</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="akadDate" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akad</label>
            <input id="akadDate" type="date" value={form.akadDate} onChange={(e) => setForm({ ...form, akadDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none" />
          </div>
          <div>
            <label htmlFor="akadTime" className="block text-sm font-medium text-gray-700 mb-1">Waktu Akad</label>
            <input id="akadTime" type="time" value={form.akadTime} onChange={(e) => setForm({ ...form, akadTime: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none" />
          </div>
        </div>
        <div className="mt-3">
          <label htmlFor="akadLocationName" className="block text-sm font-medium text-gray-700 mb-1">Nama Tempat Akad</label>
          <input id="akadLocationName" type="text" value={form.akadLocationName} onChange={(e) => setForm({ ...form, akadLocationName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none" placeholder="Contoh: Masjid Al-Ikhlas" />
        </div>
        <div className="mt-3">
          <label htmlFor="akadLocation" className="block text-sm font-medium text-gray-700 mb-1">Alamat Akad</label>
          <input id="akadLocation" type="text" value={form.akadLocation} onChange={(e) => setForm({ ...form, akadLocation: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none" placeholder="Jl. Masjid No. 1" />
        </div>
        <div className="mt-3">
          <label htmlFor="akadMapsUrl" className="block text-sm font-medium text-gray-700 mb-1">Link Maps Akad</label>
          <input id="akadMapsUrl" type="url" value={form.akadMapsUrl} onChange={(e) => setForm({ ...form, akadMapsUrl: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none" placeholder="https://maps.google.com/..." />
        </div>
      </div>

      {/* === RESEPSI === */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <h4 className="text-md font-semibold text-gray-800 mb-4">Resepsi</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="resepsiDate" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Resepsi</label>
            <input id="resepsiDate" type="date" value={form.resepsiDate} onChange={(e) => setForm({ ...form, resepsiDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none" />
          </div>
          <div>
            <label htmlFor="resepsiTime" className="block text-sm font-medium text-gray-700 mb-1">Waktu Resepsi</label>
            <input id="resepsiTime" type="time" value={form.resepsiTime} onChange={(e) => setForm({ ...form, resepsiTime: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none" />
          </div>
        </div>
        <div className="mt-3">
          <label htmlFor="resepsiLocationName" className="block text-sm font-medium text-gray-700 mb-1">Nama Tempat Resepsi</label>
          <input id="resepsiLocationName" type="text" value={form.resepsiLocationName} onChange={(e) => setForm({ ...form, resepsiLocationName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none" placeholder="Contoh: Gedung Serbaguna" />
        </div>
        <div className="mt-3">
          <label htmlFor="resepsiLocation" className="block text-sm font-medium text-gray-700 mb-1">Alamat Resepsi</label>
          <input id="resepsiLocation" type="text" value={form.resepsiLocation} onChange={(e) => setForm({ ...form, resepsiLocation: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none" placeholder="Jl. Raya No. 10" />
        </div>
        <div className="mt-3">
          <label htmlFor="resepsiMapsUrl" className="block text-sm font-medium text-gray-700 mb-1">Link Maps Resepsi</label>
          <input id="resepsiMapsUrl" type="url" value={form.resepsiMapsUrl} onChange={(e) => setForm({ ...form, resepsiMapsUrl: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none" placeholder="https://maps.google.com/..." />
        </div>
      </div>

      <div>
        <label htmlFor="hashtag" className="block text-sm font-medium text-gray-700 mb-1">
          Hashtag
        </label>
        <input
          id="hashtag"
          type="text"
          value={form.hashtag}
          onChange={(e) => setForm({ ...form, hashtag: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
          placeholder="Contoh: #JojoJejeForever"
        />
        <p className="text-xs text-gray-400 mt-1">Ditampilkan di opening screen undangan</p>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center px-6 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 font-medium cursor-pointer disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Simpan Info Acara
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// ============================================================
// Galeri Section
// ============================================================

interface GalleryItem {
  id: string;
  imageUrl: string;
  order: number;
}

function GaleriSection({
  invitationId,
  showNotification,
}: {
  invitationId: string;
  showNotification: (type: "success" | "error", message: string) => void;
}) {
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const MAX_PHOTOS = 20;

  useEffect(() => {
    fetchPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitationId]);

  const fetchPhotos = async () => {
    try {
      setLoadingPhotos(true);
      const res = await fetch(`/api/invitations/${invitationId}/gallery`);
      if (!res.ok) throw new Error("Gagal memuat galeri");
      const json = await res.json();
      setPhotos(json.data || []);
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Gagal memuat galeri");
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > MAX_PHOTOS) {
      showNotification("error", `Maksimal ${MAX_PHOTOS} foto. Sisa slot: ${MAX_PHOTOS - photos.length}`);
      e.target.value = "";
      return;
    }

    setUploading(true);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch(`/api/invitations/${invitationId}/gallery`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.message || "Gagal mengupload foto");
        }

        const json = await res.json();
        setPhotos((prev) => [...prev, json.data]);
        successCount++;
      } catch (err) {
        showNotification("error", err instanceof Error ? err.message : `Gagal mengupload ${file.name}`);
      }
    }

    if (successCount > 0) {
      showNotification("success", `${successCount} foto berhasil diupload`);
    }

    setUploading(false);
    e.target.value = "";
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm("Hapus foto ini?")) return;

    setDeletingId(photoId);
    try {
      const res = await fetch(`/api/invitations/${invitationId}/gallery?photoId=${photoId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Gagal menghapus foto");
      }

      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      showNotification("success", "Foto berhasil dihapus");
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Gagal menghapus foto");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Galeri Foto</h3>
          <p className="text-sm text-gray-500 mt-1">
            Upload foto-foto untuk ditampilkan di undangan ({photos.length}/{MAX_PHOTOS} foto)
          </p>
        </div>
      </div>

      {/* Upload Area */}
      {photos.length < MAX_PHOTOS && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-3 text-sm text-gray-600">
            Klik untuk memilih foto
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Format: JPG, PNG, WebP
          </p>
          <label className="mt-4 inline-flex items-center px-4 py-2 bg-rose-600 text-white text-sm rounded-lg hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-50">
            {uploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mengupload...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Pilih Foto
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
      )}

      {/* Loading State */}
      {loadingPhotos && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-600"></div>
          <span className="ml-2 text-sm text-gray-500">Memuat galeri...</span>
        </div>
      )}

      {/* Photo Grid */}
      {!loadingPhotos && photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
              <img
                src={photo.imageUrl}
                alt="Foto galeri"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              <button
                onClick={() => handleDelete(photo.id)}
                disabled={deletingId === photo.id}
                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                aria-label="Hapus foto"
              >
                {deletingId === photo.id ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loadingPhotos && photos.length === 0 && (
        <div className="border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-500">Belum ada foto di galeri</p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Musik Section
// ============================================================

function MusikSection({
  invitationId,
  currentMusicUrl,
  showNotification,
}: {
  invitationId: string;
  currentMusicUrl: string | null;
  showNotification: (type: "success" | "error", message: string) => void;
}) {
  const [musicUrl, setMusicUrl] = useState<string | null>(currentMusicUrl);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const MAX_SIZE_MB = 10;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side size validation
    if (file.size > MAX_SIZE_BYTES) {
      showNotification("error", `Ukuran file terlalu besar. Maksimal ${MAX_SIZE_MB}MB`);
      e.target.value = "";
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/invitations/${invitationId}/music`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Gagal mengupload musik");
      }

      const json = await res.json();
      setMusicUrl(json.data.musicUrl);
      showNotification("success", "Musik berhasil diupload");
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Gagal mengupload musik");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async () => {
    if (!confirm("Hapus musik latar ini?")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/invitations/${invitationId}/music`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Gagal menghapus musik");
      }

      setMusicUrl(null);
      showNotification("success", "Musik berhasil dihapus");
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Gagal menghapus musik");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Musik Latar</h3>
        <p className="text-sm text-gray-500 mt-1">
          Upload musik yang akan diputar saat undangan dibuka (maks. {MAX_SIZE_MB}MB, format MP3)
        </p>
      </div>

      {musicUrl ? (
        /* Music exists - show player + delete */
        <div className="border border-gray-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Musik Latar Aktif</p>
              <p className="text-xs text-gray-500 truncate">{musicUrl}</p>
            </div>
          </div>

          {/* Audio Player */}
          <audio controls className="w-full" src={musicUrl}>
            Browser Anda tidak mendukung pemutar audio.
          </audio>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {deleting ? (
              <>
                <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menghapus...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Hapus Musik
              </>
            )}
          </button>
        </div>
      ) : (
        /* No music - show upload area */
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <p className="mt-3 text-sm text-gray-600">
            Pilih file musik untuk undangan Anda
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Format: MP3 (maks. {MAX_SIZE_MB}MB)
          </p>
          <label className="mt-4 inline-flex items-center px-4 py-2 bg-rose-600 text-white text-sm rounded-lg hover:bg-rose-700 transition-colors cursor-pointer">
            {uploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mengupload...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Pilih Musik
              </>
            )}
            <input
              type="file"
              accept="audio/mpeg"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Rekening Hadiah Section
// ============================================================

interface GiftAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrisUrl?: string | null;
}

function RekeningSection({
  invitationId,
  showNotification,
}: {
  invitationId: string;
  showNotification: (type: "success" | "error", message: string) => void;
}) {
  const [accounts, setAccounts] = useState<GiftAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
  });

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitationId]);

  const fetchAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const res = await fetch(`/api/invitations/${invitationId}/gift-accounts`);
      if (!res.ok) throw new Error("Gagal memuat data rekening");
      const json = await res.json();
      setAccounts(json.data || []);
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Gagal memuat data rekening");
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bankName.trim() || !formData.accountNumber.trim() || !formData.accountHolder.trim()) {
      showNotification("error", "Semua field wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/invitations/${invitationId}/gift-accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Gagal menambahkan rekening");
      }

      const json = await res.json();
      setAccounts((prev) => [...prev, json.data]);
      setFormData({ bankName: "", accountNumber: "", accountHolder: "" });
      setShowForm(false);
      showNotification("success", "Rekening berhasil ditambahkan");
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Gagal menambahkan rekening");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm("Hapus rekening ini?")) return;

    setDeletingId(accountId);
    try {
      const res = await fetch(`/api/invitations/${invitationId}/gift-accounts?accountId=${accountId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Gagal menghapus rekening");
      }

      setAccounts((prev) => prev.filter((a) => a.id !== accountId));
      showNotification("success", "Rekening berhasil dihapus");
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Gagal menghapus rekening");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Rekening Hadiah</h3>
          <p className="text-sm text-gray-500 mt-1">
            Tambahkan rekening untuk menerima hadiah dari tamu
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-3 py-2 text-sm bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Rekening
          </button>
        )}
      </div>

      {/* Add Account Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700">Tambah Rekening Baru</h4>
          <div>
            <label htmlFor="bankName" className="block text-sm text-gray-600 mb-1">
              Nama Bank / E-Wallet <span className="text-red-500">*</span>
            </label>
            <input
              id="bankName"
              type="text"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none text-sm"
              placeholder="Contoh: BCA, Mandiri, GoPay"
              required
            />
          </div>
          <div>
            <label htmlFor="accountNumber" className="block text-sm text-gray-600 mb-1">
              Nomor Rekening <span className="text-red-500">*</span>
            </label>
            <input
              id="accountNumber"
              type="text"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none text-sm"
              placeholder="Contoh: 1234567890"
              required
            />
          </div>
          <div>
            <label htmlFor="accountHolder" className="block text-sm text-gray-600 mb-1">
              Nama Pemilik Rekening <span className="text-red-500">*</span>
            </label>
            <input
              id="accountHolder"
              type="text"
              value={formData.accountHolder}
              onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none text-sm"
              placeholder="Contoh: Ahmad Fatimah"
              required
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center px-4 py-2 text-sm bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({ bankName: "", accountNumber: "", accountHolder: "" });
              }}
              className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Loading State */}
      {loadingAccounts && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-600"></div>
          <span className="ml-2 text-sm text-gray-500">Memuat data rekening...</span>
        </div>
      )}

      {/* Accounts List */}
      {!loadingAccounts && accounts.length > 0 && (
        <div className="space-y-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{account.bankName}</p>
                  <p className="text-sm text-gray-600">{account.accountNumber}</p>
                  <p className="text-xs text-gray-500">a.n. {account.accountHolder}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(account.id)}
                disabled={deletingId === account.id}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                aria-label="Hapus rekening"
              >
                {deletingId === account.id ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loadingAccounts && accounts.length === 0 && !showForm && (
        <div className="border border-gray-200 rounded-lg p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <p className="mt-3 text-sm text-gray-600">
            Belum ada rekening yang ditambahkan
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Tambahkan rekening bank atau e-wallet untuk menerima hadiah
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Template Section
// ============================================================

function TemplateSection({
  invitationId,
  currentTemplate,
  onSaved,
}: {
  invitationId: string;
  currentTemplate: string;
  onSaved: (template: string) => void;
}) {
  const [selected, setSelected] = useState(currentTemplate);
  const [saving, setSaving] = useState(false);

  const templates = [
    {
      id: "elegant",
      name: "Elegant",
      description: "Tema elegan dengan warna gold & cream, single-page scroll, animasi halus",
      preview: "🌸",
      colors: "bg-gradient-to-br from-amber-50 to-rose-50",
    },
    {
      id: "spotify",
      name: "Spotify",
      description: "Tema dark ala Spotify dengan sidebar navigasi, music player bar, dan warna hijau accent",
      preview: "🎵",
      colors: "bg-gradient-to-br from-[#121212] to-[#1a1a1a]",
    },
    {
      id: "floral",
      name: "Floral",
      description: "Tema vintage floral dengan warna mauve & olive, ilustrasi bunga, dan nuansa romantis",
      preview: "🌸",
      colors: "bg-gradient-to-br from-[#faf7f2] to-[#f0e8df]",
    },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/invitations/${invitationId}/template`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: selected }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan template");

      onSaved(selected);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Pilih Template</h3>
        <p className="text-sm text-gray-500 mt-1">
          Pilih desain template untuk halaman undangan Anda
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => setSelected(template.id)}
            className={`relative p-5 rounded-xl border-2 text-left transition-all cursor-pointer ${
              selected === template.id
                ? "border-rose-500 ring-2 ring-rose-200 bg-rose-50/50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            {/* Preview */}
            <div className={`w-full h-28 rounded-lg mb-4 flex items-center justify-center text-4xl ${template.colors}`}>
              {template.preview}
            </div>

            {/* Info */}
            <h4 className="font-semibold text-gray-900">{template.name}</h4>
            <p className="text-sm text-gray-500 mt-1">{template.description}</p>

            {/* Selected indicator */}
            {selected === template.id && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            {/* Current badge */}
            {currentTemplate === template.id && (
              <span className="absolute top-3 left-3 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                Aktif
              </span>
            )}
          </button>
        ))}
      </div>

      {selected !== currentTemplate && (
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-6 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 font-medium cursor-pointer disabled:cursor-not-allowed"
          >
            {saving ? "Menyimpan..." : "Simpan Template"}
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Love Story Section
// ============================================================

interface LoveStoryItem {
  id: string;
  title: string;
  date: string | null;
  description: string;
  order: number;
}

function LoveStorySection({
  invitationId,
  showNotification,
}: {
  invitationId: string;
  showNotification: (type: "success" | "error", message: string) => void;
}) {
  const [stories, setStories] = useState<LoveStoryItem[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    description: "",
  });

  useEffect(() => {
    fetchStories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitationId]);

  const fetchStories = async () => {
    try {
      setLoadingStories(true);
      const res = await fetch(`/api/invitations/${invitationId}/love-stories`);
      if (!res.ok) throw new Error("Gagal memuat love story");
      const json = await res.json();
      setStories(json.data || []);
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Gagal memuat love story");
    } finally {
      setLoadingStories(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      showNotification("error", "Judul dan deskripsi wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/invitations/${invitationId}/love-stories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          date: formData.date || null,
          description: formData.description,
          order: stories.length,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Gagal menambahkan love story");
      }

      const json = await res.json();
      setStories((prev) => [...prev, json.data]);
      setFormData({ title: "", date: "", description: "" });
      setShowForm(false);
      showNotification("success", "Love story berhasil ditambahkan");
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Gagal menambahkan love story");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (storyId: string) => {
    if (!confirm("Hapus love story ini?")) return;

    setDeletingId(storyId);
    try {
      const res = await fetch(`/api/invitations/${invitationId}/love-stories?storyId=${storyId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Gagal menghapus love story");
      }

      setStories((prev) => prev.filter((s) => s.id !== storyId));
      showNotification("success", "Love story berhasil dihapus");
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Gagal menghapus love story");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Love Story</h3>
          <p className="text-sm text-gray-500 mt-1">
            Tambahkan cerita perjalanan cinta Anda
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-3 py-2 text-sm bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Story
          </button>
        )}
      </div>

      {/* Add Story Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700">Tambah Love Story Baru</h4>
          <div>
            <label htmlFor="storyTitle" className="block text-sm text-gray-600 mb-1">
              Judul <span className="text-red-500">*</span>
            </label>
            <input
              id="storyTitle"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none text-sm"
              placeholder="Contoh: Pertama Bertemu, Menjalin Hubungan, Lamaran"
              required
            />
          </div>
          <div>
            <label htmlFor="storyDate" className="block text-sm text-gray-600 mb-1">
              Tanggal / Periode
            </label>
            <input
              id="storyDate"
              type="text"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none text-sm"
              placeholder="Contoh: Januari 2022, Juni 2022, Maret 2026"
            />
          </div>
          <div>
            <label htmlFor="storyDescription" className="block text-sm text-gray-600 mb-1">
              Cerita <span className="text-red-500">*</span>
            </label>
            <textarea
              id="storyDescription"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none text-sm resize-none"
              placeholder="Ceritakan momen spesial ini..."
              required
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center px-4 py-2 text-sm bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({ title: "", date: "", description: "" });
              }}
              className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Loading State */}
      {loadingStories && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-600"></div>
          <span className="ml-2 text-sm text-gray-500">Memuat love story...</span>
        </div>
      )}

      {/* Stories List */}
      {!loadingStories && stories.length > 0 && (
        <div className="space-y-3">
          {stories.map((story) => (
            <div
              key={story.id}
              className="flex items-start justify-between border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{story.title}</p>
                  {story.date && <p className="text-xs text-rose-600 mt-0.5">{story.date}</p>}
                  <p className="text-sm text-gray-600 mt-1">{story.description}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(story.id)}
                disabled={deletingId === story.id}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
                aria-label="Hapus love story"
              >
                {deletingId === story.id ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loadingStories && stories.length === 0 && !showForm && (
        <div className="border border-gray-200 rounded-lg p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="mt-3 text-sm text-gray-600">
            Belum ada love story yang ditambahkan
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Tambahkan cerita perjalanan cinta Anda. Contoh: Pertama Bertemu, Menjalin Hubungan, Komitmen, Hari Pernikahan
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Ayat Al-Quran Section
// ============================================================

function AyatSection({
  invitationId,
  invitation,
  showNotification,
}: {
  invitationId: string;
  invitation: Invitation;
  showNotification: (type: "success" | "error", message: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    quoteSource: (invitation as unknown as { quoteSource?: string }).quoteSource || "",
    quoteArabic: (invitation as unknown as { quoteArabic?: string }).quoteArabic || "",
    quoteText: (invitation as unknown as { quoteText?: string }).quoteText || "",
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/invitations/${invitationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groomName: invitation.groomName,
          brideName: invitation.brideName,
          eventDate: new Date(invitation.eventDate).toISOString(),
          quoteSource: formData.quoteSource || undefined,
          quoteArabic: formData.quoteArabic || undefined,
          quoteText: formData.quoteText || undefined,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Gagal menyimpan ayat");
      }

      showNotification("success", "Ayat Al-Quran berhasil disimpan!");
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Ayat Al-Quran</h3>
        <p className="text-sm text-gray-500 mt-1">
          Tambahkan ayat Al-Quran yang akan ditampilkan di undangan
        </p>
      </div>

      <div>
        <label htmlFor="quoteSource" className="block text-sm font-medium text-gray-700 mb-1">
          Judul / Sumber
        </label>
        <input
          id="quoteSource"
          type="text"
          value={formData.quoteSource}
          onChange={(e) => setFormData({ ...formData, quoteSource: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
          placeholder="Contoh: QS. Ar-Rum: 21"
        />
      </div>

      <div>
        <label htmlFor="quoteArabic" className="block text-sm font-medium text-gray-700 mb-1">
          Teks Arab
        </label>
        <textarea
          id="quoteArabic"
          rows={4}
          dir="rtl"
          value={formData.quoteArabic}
          onChange={(e) => setFormData({ ...formData, quoteArabic: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none resize-none text-xl leading-loose"
          placeholder="اكتب النص العربي هنا..."
        />
        <p className="text-xs text-gray-400 mt-1">Teks Arab akan ditampilkan dengan ukuran besar dan rata kanan</p>
      </div>

      <div>
        <label htmlFor="quoteText" className="block text-sm font-medium text-gray-700 mb-1">
          Arti / Makna (Terjemahan)
        </label>
        <textarea
          id="quoteText"
          rows={4}
          value={formData.quoteText}
          onChange={(e) => setFormData({ ...formData, quoteText: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none resize-none"
          placeholder="Contoh: Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri..."
        />
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center px-6 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 font-medium cursor-pointer disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Simpan
            </>
          )}
        </button>
      </div>
    </form>
  );
}
