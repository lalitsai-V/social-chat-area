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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
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
    <div className="flex h-screen bg-gray-50">
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
