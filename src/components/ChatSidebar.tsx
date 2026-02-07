"use client";

import { useState, useMemo, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface User {
  id: string;
  email: string;
  isOnline: boolean;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  currentUserId?: string;
}

export default function ChatSidebar({ isOpen, onClose, currentUserId }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useMemo(() => createClient(), []);

  // Fetch all users from user_profiles
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabaseRef
          .from("user_profiles")
          .select("id, email")
          .order("email", { ascending: true });

        if (error) {
          console.error("❌ Error fetching users:", error);
          return;
        }

        if (data) {
          // Filter out current user and map to User interface
          const allUsers = data
            .filter((user) => user.id !== currentUserId)
            .map((user) => ({
              id: user.id,
              email: user.email,
              isOnline: true, // In a real app, you'd track session activity
            }));

          setUsers(allUsers);
          console.log("✅ Fetched", allUsers.length, "users");
        }
      } catch (err) {
        console.error("❌ Exception fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    // Set up realtime subscription for user_profiles changes
    const channel = supabaseRef
      .channel("user_profiles_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_profiles",
        },
        () => {
          console.log("👥 User list changed, refreshing...");
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabaseRef.removeChannel(channel);
    };
  }, [supabaseRef, currentUserId]);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    return users.filter((user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, users]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 z-40 transform transition-transform duration-300 overflow-y-auto lg:static lg:transform-none ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 space-y-4">
          <div className="flex items-center justify-between lg:hidden">
            <h2 className="font-bold text-slate-900 text-lg">Contacts</h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-slate-50"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="p-2">
          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center">
                <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
              <p className="text-slate-500 text-sm mt-2">Loading contacts...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-2xl mb-2">👤</div>
              <p className="text-slate-600 text-sm font-medium">
                {searchQuery ? "No contacts found" : "No other users available"}
              </p>
              {!searchQuery && (
                <p className="text-slate-500 text-xs mt-1">Start by inviting others to chat</p>
              )}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user.id}
                className="w-full text-left px-4 py-3 hover:bg-blue-600 hover:text-white rounded-lg transition-all border-l-4 border-transparent hover:border-blue-600 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-xs font-bold text-white">
                          {user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                          {user.email.split("@")[0]}
                        </h3>
                        <p className="text-xs text-slate-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  {user.isOnline && (
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full flex-shrink-0 mt-1.5 shadow-sm" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
