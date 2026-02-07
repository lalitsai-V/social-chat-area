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
  reactions?: { id: string; user_id: string; emoji: string; created_at: string }[];
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
        const msgs = data as Message[];

        // Fetch reactions for all messages
        const ids = msgs.map((m) => m.id);
        let reactions: any[] = [];
        if (ids.length) {
          const { data: reactionData } = await supabase
            .from("reactions")
            .select("*")
            .in("message_id", ids);
          reactions = reactionData || [];
        }

        const enhancedMessages = await Promise.all(
          msgs.map(async (msg) => {
            let userEmailFromMsg = msg.user_email || "Unknown";
            if (!userEmailFromMsg || userEmailFromMsg === "Unknown") {
              const { data: userData } = await supabase
                .from("user_profiles")
                .select("email")
                .eq("id", msg.user_id)
                .single();
              userEmailFromMsg = userData?.email || "Unknown";
            }

            const msgReactions = reactions.filter((r) => r.message_id === msg.id).map((r) => ({ id: r.id, user_id: r.user_id, emoji: r.emoji, created_at: r.created_at }));

            return { ...msg, user_email: userEmailFromMsg, reactions: msgReactions };
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

  const handleSendMessage = async (
    e: FormEvent<HTMLFormElement>,
    attachmentUrl?: string,
    attachmentType?: "image" | "document"
  ) => {
    e.preventDefault();

    if (!newMessage.trim() && !attachmentUrl) {
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
        image_url: attachmentUrl,
        reply_to_id: selectedReplyId || undefined,
        _optimistic: true,
      };

      setMessages((prev) => [...prev, optimisticMsg]);
      scrollToBottom();

      const { error } = await supabase.from("messages").insert({
        content: newMessage,
        user_id: userId,
        user_email: userEmail,
        image_url: attachmentUrl,
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
        if (attachmentUrl) {
          try {
            // Clean up both image and document buckets depending on type
            if (attachmentType === "document") {
              // attempt to remove from documents bucket
              const urlParts = attachmentUrl.split("/");
              const filePath = urlParts.slice(-2).join("/");
              await supabaseRef.current.storage.from("chat-documents").remove([filePath]);
            } else {
              await imageUploadService.deleteImage(attachmentUrl as string);
            }
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

  // Reactions handling
  const [openReactionPickerFor, setOpenReactionPickerFor] = useState<string | null>(null);

  const toggleReaction = async (messageId: string, emoji: string) => {
    const supabase = supabaseRef.current;
    // capture previous reactions to allow revert on failure
    const previous = messages.find((m) => m.id === messageId)?.reactions || [];

    // Optimistic UI update
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const userReaction = (m.reactions || []).find((r) => r.user_id === userId);
        let newReactions = (m.reactions || []).slice();
        if (userReaction && userReaction.emoji === emoji) {
          // remove reaction
          newReactions = newReactions.filter((r) => r.user_id !== userId);
        } else {
          // replace or add
          newReactions = newReactions.filter((r) => r.user_id !== userId);
          newReactions.push({ id: `temp-${Date.now()}`, user_id: userId, emoji, created_at: new Date().toISOString() } as any);
        }
        return { ...m, reactions: newReactions };
      })
    );

    try {
      // Remove any existing reaction by this user for the message
      const { error: delError } = await supabase.from("reactions").delete().match({ message_id: messageId, user_id: userId });
      if (delError) {
        console.error("❌ Error deleting existing reaction:", delError, JSON.stringify(delError, Object.getOwnPropertyNames(delError)));
        throw delError;
      }

      // Decide whether to insert new reaction: check previous (pre-optimistic) value
      const prevUserReaction = previous.find((r) => r.user_id === userId);
      const shouldInsert = !prevUserReaction || prevUserReaction.emoji !== emoji;
      if (shouldInsert) {
        // Ensure the user has a profile row to satisfy foreign key constraint
        try {
          const { error: upsertProfileErr } = await supabase.from("user_profiles").upsert({ id: userId, email: userEmail });
          if (upsertProfileErr) {
            console.warn("⚠️ Failed to upsert user profile before inserting reaction:", upsertProfileErr);
            // proceed — insertion may still fail and be handled below
          }
        } catch (e) {
          console.warn("⚠️ Unexpected error upserting profile:", e);
        }

        const { data: insertData, error: insertError } = await supabase.from("reactions").insert({ message_id: messageId, user_id: userId, emoji }).select();
        if (insertError) {
          console.error("❌ Error inserting reaction:", insertError, JSON.stringify(insertError, Object.getOwnPropertyNames(insertError)));
          // Handle unique constraint violation gracefully (someone else inserted concurrently)
          const code = (insertError as any)?.code || (insertError as any)?.status;
          if (code === "23505" || code === 409) {
            // conflict - ignore and continue to refresh
            console.warn("⚠️ Insert conflict detected, continuing to refresh reactions");
          } else if ((insertError as any)?.code === "23503") {
            // FK violation persisted — likely user_profiles row is missing or constrained differently
            console.error("❌ Foreign key violation inserting reaction. Ensure user_profiles contains the current user id.");
            throw insertError;
          } else {
            throw insertError;
          }
        }
      }

      // Refresh reactions for this message
      const { data: reactionData, error: reactionError } = await supabase.from("reactions").select("*").eq("message_id", messageId);
      if (reactionError) {
        console.error("❌ Error fetching reactions:", reactionError, JSON.stringify(reactionError, Object.getOwnPropertyNames(reactionError)));
        throw reactionError;
      }
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, reactions: reactionData || [] } : m)));
    } catch (err: any) {
      console.error("❌ Reaction update failed:", err, {
        messageId,
        emoji,
      });
      // Revert optimistic UI
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, reactions: previous } : m)));
    }
  };

  const emojiOptions = ["👍", "❤️", "😂", "😮", "😢", "👏", "🎉", "🔥"];

  return (
    <div className="flex flex-col h-full relative">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/charbg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay for Readability */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Messages Container */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 relative"
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
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg"
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
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-2.5 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <span className="text-lg">💬</span>
              <span>{newRepliesCount} reply{newRepliesCount !== 1 ? "ies" : ""} to you</span>
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-7xl">💬</div>
              <div>
                <p className="text-slate-900 text-lg font-bold">No messages yet</p>
                <p className="text-slate-600 text-sm mt-2">Start the conversation by sending a message!</p>
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwner = msg.user_id === userId;
            const repliedMsg = msg.reply_to_id ? messages.find((m) => m.id === msg.reply_to_id) : null;

            // Show a date separator when this message is the first of a new day
            const prev = messages[idx - 1];
            const msgDate = new Date(msg.created_at);
            const prevDate = prev ? new Date(prev.created_at) : null;
            const isNewDay = !prevDate || msgDate.toDateString() !== prevDate.toDateString();

            const formatDateHeader = (d: Date) => {
              const today = new Date();
              const yesterday = new Date();
              yesterday.setDate(today.getDate() - 1);

              if (d.toDateString() === today.toDateString()) return "Today";
              if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
              return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
            };

            return (
              <div key={msg.id} className="w-full">
                {isNewDay && (
                  <div className="flex items-center justify-center my-4">
                    <span className="px-3 py-1 rounded-full text-xs bg-slate-100 text-slate-600 border border-slate-200">
                      {formatDateHeader(msgDate)}
                    </span>
                  </div>
                )}

                <div className={`flex ${isOwner ? "justify-end" : "justify-start"} animate-slideInUp`}>
                  <div
                    className={`group flex gap-3 max-w-md md:max-w-lg ${
                      isOwner ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    {!isOwner && (
                      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                        {msg.user_email?.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className="flex flex-col">
                      <div
                        className={`px-4 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all ${
                          isOwner
                            ? "bg-slate-200 text-slate-900 rounded-br-none border border-slate-200"
                            : "bg-white text-slate-900 rounded-bl-none border border-slate-200"
                        }`}
                      >
                        {!isOwner && (
                          <p className="text-xs font-semibold mb-1 text-blue-600">
                            {msg.user_email?.split("@")[0]}
                          </p>
                        )}

                        {/* Reply preview (if this message is a reply) */}
                        {repliedMsg && (
                          <div className={`mb-2 p-2 rounded-md ${isOwner ? "bg-slate-200 text-slate-900" : "bg-slate-100 text-slate-700"}`}>
                            <p className="text-xs font-medium truncate">
                              {repliedMsg.user_email ? repliedMsg.user_email.split("@")[0] : "Unknown"}
                            </p>
                            {repliedMsg.image_url ? (
                              <p className="text-xs truncate opacity-80">Attachment</p>
                            ) : (
                              <p className="text-sm truncate">{repliedMsg.content}</p>
                            )}
                          </div>
                        )}

                        {/* Attachment (image or document) */}
                        {msg.image_url && (
                          <div className="mb-2">
                            {msg.image_url.toLowerCase().endsWith('.pdf') || msg.image_url.includes('/chat-documents/') ? (
                              <a href={msg.image_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-slate-50 border border-slate-200 text-sm text-slate-700">
                                <span className="w-6 h-6 bg-red-50 text-red-600 rounded flex items-center justify-center font-bold">PDF</span>
                                <span className="truncate">Open document</span>
                              </a>
                            ) : (
                              <img 
                                src={msg.image_url} 
                                alt="Message attachment"
                                className="max-w-xs rounded-lg max-h-64 object-cover shadow-md border border-slate-200"
                                loading="lazy"
                              />
                            )}
                          </div>
                        )}

                        {/* Text content */}
                        {msg.content && (
                          <p className={`break-words text-sm leading-relaxed text-slate-900`}>
                            {msg.content}
                          </p>
                        )}

                        {msg.is_edited && (
                          <p className={`text-xs mt-1 opacity-70 text-slate-500`}>(edited)</p>
                        )}
                      </div>

                      {/* Reactions display */}
                        <div className="mt-2 flex items-center gap-2">
                          {(msg.reactions || []).length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                              {Object.entries((msg.reactions || []).reduce((acc, r) => {
                                acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>)).map(([emoji, count]) => (
                                <button
                                  key={emoji}
                                  onClick={() => toggleReaction(msg.id, emoji)}
                                  className={`px-2 py-1 rounded-full bg-slate-100 text-xs flex items-center gap-2 border border-slate-200 hover:bg-slate-200`}
                                  title={`React with ${emoji}`}
                                >
                                  <span>{emoji}</span>
                                  <span className="text-slate-600">{count}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          <div className="relative">
                            <button
                              onClick={() => setOpenReactionPickerFor(openReactionPickerFor === msg.id ? null : msg.id)}
                              className="text-white hover:text-blue-300 transition-colors"
                              title="Add reaction"
                            >
                              🙂
                            </button>

                            {openReactionPickerFor === msg.id && (
                              <div className="absolute bottom-full mb-2 left-0 bg-white border rounded-lg p-2 shadow-md flex gap-2 z-50">
                                {emojiOptions.map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() => {
                                      toggleReaction(msg.id, emoji);
                                      setOpenReactionPickerFor(null);
                                    }}
                                    className="px-2 py-1 text-lg"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                        </div>

                        {/* Timestamp and Actions */}
                        <div
                          className={`flex items-center gap-2 mt-1.5 text-xs ${
                            isOwner ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          <span className="text-white">
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
                            className="text-white hover:text-blue-300 transition-colors"
                            title="Reply to this message"
                          >
                            ↩️
                          </button>
                        )}
                      </div>
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
    </div>
  );
}
