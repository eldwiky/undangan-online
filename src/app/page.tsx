import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-rose-50 to-amber-50 px-4">
      <div className="max-w-lg mx-auto text-center">
        {/* Decorative element */}
        <p className="text-amber-600/60 text-2xl mb-4">❦</p>

        <h1 className="text-4xl md:text-5xl font-serif text-gray-800 mb-4">
          Web Undangan
        </h1>

        <p className="text-lg text-gray-600 mb-2">
          Buat undangan pernikahan digital yang elegan
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Mudah dibuat, indah dilihat, cepat dibagikan
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="px-8 py-3 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors font-medium shadow-lg w-full sm:w-auto text-center"
          >
            Buat Undangan
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 border border-amber-600 text-amber-700 rounded-full hover:bg-amber-50 transition-colors font-medium w-full sm:w-auto text-center"
          >
            Masuk
          </Link>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-2xl mb-1">🎵</p>
            <p className="text-xs text-gray-600">Musik Latar</p>
          </div>
          <div>
            <p className="text-2xl mb-1">📸</p>
            <p className="text-xs text-gray-600">Galeri Foto</p>
          </div>
          <div>
            <p className="text-2xl mb-1">📍</p>
            <p className="text-xs text-gray-600">Lokasi Maps</p>
          </div>
          <div>
            <p className="text-2xl mb-1">💝</p>
            <p className="text-xs text-gray-600">Hadiah Digital</p>
          </div>
        </div>
      </div>
    </div>
  );
}
