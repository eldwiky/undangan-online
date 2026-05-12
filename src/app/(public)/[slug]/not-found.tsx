import Link from "next/link";

export default function InvitationNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-rose-50 to-amber-50 px-4 text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-6xl font-serif text-amber-600 mb-4">404</h1>
        <h2 className="text-2xl font-serif text-gray-800 mb-4">
          Undangan tidak ditemukan
        </h2>
        <p className="text-gray-600 mb-8">
          Maaf, undangan yang Anda cari tidak tersedia atau link tidak valid.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors font-medium"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
