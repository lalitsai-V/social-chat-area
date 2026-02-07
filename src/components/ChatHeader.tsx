"use client";

import { useState } from "react";
import Link from "next/link";

interface ChatHeaderProps {
  userEmail: string;
  onLogout: () => Promise<void>;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export default function ChatHeader({
  userEmail,
  onLogout,
  onToggleSidebar,
  sidebarOpen = true,
}: ChatHeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const userInitial = userEmail.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200/50 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Logo and Menu Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="hidden md:inline-flex lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Toggle sidebar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">💬</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              ChatBox
            </h1>
          </Link>
        </div>

        {/* Right: User Profile and Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-semibold text-sm">{userInitial}</span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {userEmail.split("@")[0]}
              </p>
              <p className="text-xs text-slate-500 truncate">{userEmail}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all font-medium text-sm shadow-md hover:shadow-lg"
          >
            {isLoggingOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
      </div>
    </header>
  );
}
