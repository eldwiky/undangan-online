"use client";

import { signOut, useSession } from "next-auth/react";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/navigation";

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const userInitial = session?.user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-white to-amber-50/50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/60 bg-gradient-to-r from-white/80 via-rose-50/60 to-amber-50/60 backdrop-blur-xl shadow-sm shadow-rose-100/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">💍</span>
              <h1 className="text-xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                Web Undangan
              </h1>
            </div>

            {/* User section */}
            <div className="flex items-center gap-3">
              {session?.user?.name && (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white text-sm font-semibold shadow-md shadow-rose-200/50">
                    {userInitial}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                    {session.user.name}
                  </span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="text-sm px-3.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all duration-200 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Decorative divider */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-rose-200 to-transparent">
        <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-white px-2 text-rose-300 text-sm">❀</span>
      </div>

      {/* Floating floral decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <span className="absolute top-20 left-[5%] text-3xl opacity-[0.07] animate-float">🌸</span>
        <span className="absolute top-40 right-[8%] text-2xl opacity-[0.06] animate-float-slow">🌿</span>
        <span className="absolute top-[60%] left-[3%] text-2xl opacity-[0.05] animate-float-reverse">🌺</span>
        <span className="absolute top-[30%] right-[4%] text-3xl opacity-[0.06] animate-float">🍃</span>
        <span className="absolute bottom-[20%] left-[10%] text-2xl opacity-[0.05] animate-float-slow">🌷</span>
        <span className="absolute bottom-[40%] right-[12%] text-xl opacity-[0.06] animate-float-reverse">✿</span>
        <span className="absolute top-[80%] right-[20%] text-2xl opacity-[0.04] animate-float">🌹</span>
      </div>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </SessionProvider>
  );
}
