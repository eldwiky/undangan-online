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

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
