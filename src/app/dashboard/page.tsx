"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/lib/auth/service";
import Chat from "@/components/Chat";
import ChatHeader from "@/components/ChatHeader";
import { useTransition } from "react";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  const handleLogout = async () => {
    startTransition(async () => {
      await authService.signOut();
      router.replace("/");
    });
  };

  return (
    <div className="flex h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <ChatHeader
          userEmail={user.email || ""}
          onLogout={handleLogout}
        />

        {/* Chat Area */}
        <main className="flex-1 overflow-hidden">
          <Chat userId={user.id} userEmail={user.email || ""} />
        </main>
      </div>
    </div>
  );
}
