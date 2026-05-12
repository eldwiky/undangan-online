import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fdf8f0] overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-200/10 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-amber-200/50 shadow-sm mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-gray-600">Platform undangan digital #1 Indonesia</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-serif text-gray-900 mb-6 leading-tight">
            Buat Undangan
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-rose-500 to-purple-600">
              Digital Impianmu
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-4 max-w-2xl mx-auto leading-relaxed">
            Desain elegan, fitur lengkap, siap dibagikan dalam hitungan menit.
            Buat momen spesialmu lebih berkesan.
          </p>

          <p className="text-sm text-gray-400 mb-10">
            Gratis • Tanpa coding • Mobile friendly
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/register"
              className="group relative px-8 py-4 bg-gradient-to-r from-amber-600 to-rose-600 text-white rounded-full font-semibold text-lg shadow-lg shadow-amber-600/25 hover:shadow-xl hover:shadow-amber-600/30 transition-all hover:-translate-y-0.5 w-full sm:w-auto text-center"
            >
              <span className="relative z-10">Buat Undangan Gratis</span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-700 to-rose-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white text-gray-700 rounded-full font-medium text-lg border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all w-full sm:w-auto text-center shadow-sm"
            >
              Masuk →
            </Link>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {[
              { icon: "🎵", label: "Musik Latar" },
              { icon: "📸", label: "Galeri Foto" },
              { icon: "📍", label: "Lokasi Maps" },
              { icon: "💝", label: "Hadiah Digital" },
              { icon: "💌", label: "RSVP Online" },
              { icon: "🎨", label: "Multi Template" },
            ].map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-100 shadow-sm"
              >
                <span className="text-lg">{feature.icon}</span>
                <span className="text-sm text-gray-700 font-medium">{feature.label}</span>
              </div>
            ))}
          </div>

          {/* Template preview cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-[#121212] to-[#1a1a1a] rounded-2xl p-6 text-center shadow-xl border border-gray-800">
              <div className="text-2xl mb-2">🎵</div>
              <h3 className="text-white font-semibold text-sm">Spotify</h3>
              <p className="text-gray-400 text-xs mt-1">Dark & Modern</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-rose-50 rounded-2xl p-6 text-center shadow-xl border border-amber-100">
              <div className="text-2xl mb-2">✨</div>
              <h3 className="text-gray-800 font-semibold text-sm">Elegant</h3>
              <p className="text-gray-500 text-xs mt-1">Classic & Timeless</p>
            </div>
            <div className="bg-gradient-to-br from-[#2d3a2e] to-[#1a2a1c] rounded-2xl p-6 text-center shadow-xl border border-[#8B3A62]/30">
              <div className="text-2xl mb-2">🌸</div>
              <h3 className="text-[#f5e6d3] font-semibold text-sm">Floral</h3>
              <p className="text-[#f5e6d3]/60 text-xs mt-1">Vintage & Romantic</p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-gray-400 rounded-full" />
          </div>
        </div>
      </section>
    </div>
  );
}
