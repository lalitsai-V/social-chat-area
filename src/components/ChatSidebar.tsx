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
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 overflow-y-auto lg:static lg:transform-none ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h2 className="font-bold text-black">Chats</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="p-2">
          {loading ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              <div className="animate-pulse">Loading users...</div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              {searchQuery ? "No users found" : "No other users available"}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user.id}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors border-l-4 border-transparent hover:border-red-600 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-red-600">
                          {user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm truncate">
                          {user.email.split("@")[0]}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  {user.isOnline && (
                    <span className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0 mt-1" />
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
