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

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Logo and Menu Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="hidden md:inline-flex lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">💬</span>
            </div>
            <h1 className="text-xl font-bold text-black">ChatBox</h1>
          </Link>
        </div>

        {/* Right: User Profile and Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-semibold text-sm">
                {userEmail.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userEmail.split("@")[0]}
              </p>
              <p className="text-xs text-gray-500 truncate">{userEmail}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors font-medium text-sm"
          >
            {isLoggingOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
      </div>
    </header>
  );
}
