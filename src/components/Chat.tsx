"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import MessageInput from "./MessageInput";
import MessageActions from "./MessageActions";
import { imageUploadService } from "@/lib/imageUpload/service";

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  user_email?: string;
  is_edited?: boolean;
  image_url?: string;
  reply_to_id?: string;
  replied_message?: Message;
}

interface ChatProps {
  userId: string;
  userEmail: string;
}

export default function Chat({ userId, userEmail }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [selectedReplyId, setSelectedReplyId] = useState<string | null>(null);
  const [selectedReplyMessage, setSelectedReplyMessage] = useState<Message | null>(null);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [hasNewReplies, setHasNewReplies] = useState(false);
  const [newRepliesCount, setNewRepliesCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const supabaseRef = useRef(createClient());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const pollRef = useRef<{ interval?: ReturnType<typeof setInterval>; timeout?: ReturnType<typeof setTimeout> }>(
    {}
  );
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if user is at the bottom of the chat
  const isAtBottom = () => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 10; // 10px threshold
    isAtBottomRef.current = atBottom;
    return atBottom;
  };

  // Only scroll to bottom if user is at the bottom
  const scrollToBottom = () => {
    if (isAtBottom()) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setHasNewMessages(false);
      setNewMessageCount(0);
      setHasNewReplies(false);
      setNewRepliesCount(0);
    }
  };

  // Handle user scroll
  const handleScroll = () => {
    setIsUserScrolling(true);
    isAtBottom(); // Update ref
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
      // Clear new message indicator if user scrolls to bottom
      if (isAtBottom()) {
        setHasNewMessages(false);
        setNewMessageCount(0);
        setHasNewReplies(false);
        setNewRepliesCount(0);
      }
    }, 1500); // Stop considering it user scrolling after 1.5 seconds of no scroll
  };

  // Fetch messages helper (used by initial load, realtime confirmation, and polling)
  const fetchMessages = async () => {
    const supabase = supabaseRef.current;
    try {
      console.log("🔄 Fetching messages...");
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) {
        console.error("❌ Error fetching messages:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        return;
      }

      console.log("✅ Fetched", data?.length || 0, "messages");

      if (data) {
        const enhancedMessages = await Promise.all(
          data.map(async (msg) => {
            let userEmailFromMsg = msg.user_email || "Unknown";
            if (!userEmailFromMsg || userEmailFromMsg === "Unknown") {
              const { data: userData } = await supabase
                .from("user_profiles")
                .select("email")
                .eq("id", msg.user_id)
                .single();
              userEmailFromMsg = userData?.email || "Unknown";
            }
            return { ...msg, user_email: userEmailFromMsg };
          })
        );
        setMessages(enhancedMessages);
        scrollToBottom();
      }
    } catch (err) {
      console.error("❌ Exception fetching messages:", err);
    }
  };

  useEffect(() => {
    const supabase = supabaseRef.current;

    // initial load
    fetchMessages();

    // Set up realtime subscription
    try {
      console.log("🔗 Setting up Realtime subscription...");
      const channel = supabase
        .channel("messages")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
          },
          async (payload) => {
            console.log("📨 New message received:", payload.new);
            const newMsg = payload.new as Message;
            let userEmailFromMsg = newMsg.user_email || "Unknown";
            if (!userEmailFromMsg || userEmailFromMsg === "Unknown") {
              const { data: userData } = await supabase
                .from("user_profiles")
                .select("email")
                .eq("id", newMsg.user_id)
                .single();
              userEmailFromMsg = userData?.email || "Unknown";
            }
            
            // Check if at bottom using ref
            const wasAtBottom = isAtBottomRef.current;
            console.log("Was at bottom before new message:", wasAtBottom, "isAtBottomRef.current:", isAtBottomRef.current);
            
            // Check if this message is a reply to one of the current user's messages
            let isReplyToUser = false;
            if (newMsg.reply_to_id) {
              const repliedToMsg = messages.find((m) => m.id === newMsg.reply_to_id);
              if (repliedToMsg && repliedToMsg.user_id === userId) {
                isReplyToUser = true;
                console.log("🔔 New reply to user's message!");
              }
            }
            
            setMessages((prev) => [
              ...prev,
              { ...newMsg, user_email: userEmailFromMsg },
            ]);
            
            // Show reply notification if this is a reply to user's message and user is not at bottom
            if (isReplyToUser && !wasAtBottom) {
              console.log("📬 Setting new reply indicator");
              setHasNewReplies(true);
              setNewRepliesCount((prev) => prev + 1);
            }
            
            // Show new message indicator if user is not at bottom
            if (!wasAtBottom && !isReplyToUser) {
              console.log("🔔 Setting new message indicator");
              setHasNewMessages(true);
              setNewMessageCount((prev) => prev + 1);
            } else if (!wasAtBottom) {
              // User is at bottom - scroll to latest
              console.log("📍 User at bottom, scrolling to latest");
              setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }
          }
        )
        .subscribe((status) => {
          console.log("📡 Realtime subscription status:", status);
        });

      channelRef.current = channel;
      console.log("✅ Realtime subscription established");
    } catch (err) {
      console.error("❌ Error setting up Realtime:", err);
    }

    // Set up automatic refresh polling every 2 seconds as fallback
    const refreshInterval = setInterval(() => {
      console.log("⏰ Auto-refreshing messages every 2 seconds...");
      fetchMessages();
    }, 1000);

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      // clear any polling timers on unmount
      if (pollRef.current.interval) clearInterval(pollRef.current.interval);
      if (pollRef.current.timeout) clearTimeout(pollRef.current.timeout);
      clearInterval(refreshInterval);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>, imageUrl?: string) => {
    e.preventDefault();

    if (!newMessage.trim() && !imageUrl) {
      return;
    }

    setLoading(true);

    try {
      const supabase = supabaseRef.current;
      // Optimistic message so the user sees it immediately
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const optimisticMsg: Message & { _optimistic?: boolean } = {
        id: tempId,
        content: newMessage,
        user_id: userId,
        user_email: userEmail,
        created_at: new Date().toISOString(),
        image_url: imageUrl,
        reply_to_id: selectedReplyId || undefined,
        _optimistic: true,
      };

      setMessages((prev) => [...prev, optimisticMsg]);
      scrollToBottom();

      const { error } = await supabase.from("messages").insert({
        content: newMessage,
        user_id: userId,
        user_email: userEmail,
        image_url: imageUrl,
        reply_to_id: selectedReplyId || undefined,
      });

      if (error) {
        console.error("❌ Error sending message:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        // remove optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
        // Delete uploaded image if message send failed
        if (imageUrl) {
          try {
            await imageUploadService.deleteImage(imageUrl);
          } catch (err) {
            console.error("Failed to clean up uploaded image:", err);
          }
        }
      } else {
        console.log("✅ Message sent successfully");
        setNewMessage("");
        setSelectedReplyId(null);
        setSelectedReplyMessage(null);

        // Immediately fetch updated messages to replace optimistic message with real one
        // This ensures the message shows up for both users immediately
        setTimeout(() => {
          fetchMessages();
        }, 100);
      }
    } catch (err) {
      console.error("❌ Exception sending message:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: string, imageUrl?: string) => {
    const supabase = supabaseRef.current;
    try {
      console.log("🗑️ Attempting to delete message:", messageId);
      
      const { error, data } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId)
        .eq("user_id", userId)
        .select();

      if (error) {
        console.error("❌ Error deleting message:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        alert("Failed to delete message: " + (error.message || "Unknown error"));
        return;
      }

      console.log("✅ Message deleted successfully from database", data);
      
      // Delete image from storage if it exists
      if (imageUrl) {
        try {
          await imageUploadService.deleteImage(imageUrl);
          console.log("✅ Image deleted from storage");
        } catch (err) {
          console.error("⚠️ Failed to delete image from storage:", err);
          // Continue anyway - message was deleted from DB
        }
      }
      
      setMessages((prev) => {
        const updated = prev.filter((m) => m.id !== messageId);
        console.log("Message removed from UI. Remaining messages:", updated.length);
        return updated;
      });
    } catch (err) {
      console.error("❌ Exception deleting message:", err);
      alert("Failed to delete message: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    const supabase = supabaseRef.current;
    try {
      // Update message content only (is_edited might not exist in the database)
      const { error } = await supabase
        .from("messages")
        .update({ content: newContent })
        .eq("id", messageId)
        .eq("user_id", userId);

      if (error) {
        console.error("❌ Error editing message:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        alert("Failed to edit message: " + (error.message || "Unknown error"));
      } else {
        console.log("✅ Message edited successfully");
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, content: newContent, is_edited: true }
              : m
          )
        );
      }
    } catch (err) {
      console.error("❌ Exception editing message:", err);
      alert("Failed to edit message");
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 space-y-4 relative"
      >
        {/* New Messages Indicator */}
        {hasNewMessages && (
          <div className="sticky top-0 z-50 mb-4">
            <button
              onClick={() => {
                console.log("Jump to latest clicked");
                setHasNewMessages(false);
                setNewMessageCount(0);
                setTimeout(() => {
                  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 0);
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <span className="text-lg">⬇️</span>
              <span>{newMessageCount} new message{newMessageCount !== 1 ? "s" : ""}</span>
            </button>
          </div>
        )}

        {/* New Replies Indicator */}
        {hasNewReplies && (
          <div className="sticky top-0 z-50 mb-4 pt-4">
            <button
              onClick={() => {
                console.log("Jump to replies clicked");
                setHasNewReplies(false);
                setNewRepliesCount(0);
                setTimeout(() => {
                  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 0);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <span className="text-lg">💬</span>
              <span>{newRepliesCount} reply{newRepliesCount !== 1 ? "ies" : ""} to you</span>
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-4">💬</div>
              <p className="text-gray-500 text-lg font-medium">
                No messages yet
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Start the conversation!
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwner = msg.user_id === userId;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwner ? "justify-end" : "justify-start"} animate-fadeIn`}
              >
                <div
                  className={`group flex gap-2 max-w-md ${
                    isOwner ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  {!isOwner && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700">
                      {msg.user_email?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className="flex flex-col">
                    <div
                      className={`px-4 py-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow ${
                        isOwner
                          ? "bg-red-600 text-white rounded-br-none"
                          : "bg-gray-100 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      {!isOwner && (
                        <p className="text-xs font-semibold mb-1 opacity-70">
                          {msg.user_email?.split("@")[0]}
                        </p>
                      )}
                      
                      {/* Image */}
                      {msg.image_url && (
                        <div className="mb-2">
                          <img 
                            src={msg.image_url} 
                            alt="Message attachment"
                            className="max-w-xs rounded-lg max-h-64 object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                      
                      {/* Text content */}
                      {msg.content && (
                        <p className="break-words text-sm leading-relaxed">
                          {msg.content}
                        </p>
                      )}
                      
                      {msg.is_edited && (
                        <p className="text-xs mt-1 opacity-60">(edited)</p>
                      )}
                    </div>

                    {/* Timestamp and Actions */}
                    <div
                      className={`flex items-center gap-2 mt-1 text-xs ${
                        isOwner ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <span className="text-gray-400">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isOwner && (
                        <MessageActions
                          messageId={msg.id}
                          isOwner={isOwner}
                          currentContent={msg.content}
                          imageUrl={msg.image_url}
                          onEdit={(content) =>
                            handleEditMessage(msg.id, content)
                          }
                          onDelete={() => handleDeleteMessage(msg.id, msg.image_url)}
                          onReply={() => {
                            setSelectedReplyId(msg.id);
                            setSelectedReplyMessage(msg);
                          }}
                        />
                      )}
                      {!isOwner && (
                        <button
                          onClick={() => {
                            setSelectedReplyId(msg.id);
                            setSelectedReplyMessage(msg);
                          }}
                          className="text-gray-400 hover:text-red-500 text-xs transition-colors"
                          title="Reply to this message"
                        >
                          ↩
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        value={newMessage}
        onChange={setNewMessage}
        onSend={handleSendMessage}
        isLoading={loading}
        userId={userId}
        replyingTo={selectedReplyMessage ? {
          id: selectedReplyMessage.id,
          user_email: selectedReplyMessage.user_email || "Unknown",
          content: selectedReplyMessage.content
        } : null}
        onClearReply={() => {
          setSelectedReplyId(null);
          setSelectedReplyMessage(null);
        }}
      />
    </div>
  );
}
