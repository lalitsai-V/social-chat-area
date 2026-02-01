"use client";

import { useState, FormEvent, useRef } from "react";
import { imageUploadService } from "@/lib/imageUpload/service";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (e: FormEvent<HTMLFormElement>, imageUrl?: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  userId?: string;
  replyingTo?: { id: string; user_email: string; content: string } | null;
  onClearReply?: () => void;
}

export default function MessageInput({
  value,
  onChange,
  onSend,
  isLoading,
  disabled = false,
  userId,
  replyingTo,
  onClearReply,
}: MessageInputProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emojis = ["😀", "😂", "😍", "🤔", "👍", "🎉", "🚀", "✨"];

  const handleEmojiClick = (emoji: string) => {
    onChange(value + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    try {
      setUploadingImage(true);
      const imageUrl = await imageUploadService.uploadImage(file, userId);
      if (imageUrl) {
        setSelectedImageUrl(imageUrl);
        console.log("✅ Image ready to send:", imageUrl);
      }
    } catch (err) {
      console.error("❌ Image upload failed:", err);
      alert(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    onSend(e, selectedImageUrl || undefined);
    setSelectedImageUrl(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky bottom-0 bg-black border-t border-gray-800 p-4 shadow-lg"
    >
      {/* Replying to Indicator */}
      {replyingTo && (
        <div className="mb-3 bg-gray-900 border-l-4 border-red-600 p-2 rounded flex justify-between items-start">
          <div className="flex-1">
            <p className="text-xs text-gray-400 mb-1">Replying to {replyingTo.user_email?.split("@")[0]}</p>
            <p className="text-sm text-gray-200 truncate">{replyingTo.content}</p>
          </div>
          <button
            type="button"
            onClick={onClearReply}
            className="ml-2 text-gray-400 hover:text-gray-200 text-lg leading-none"
          >
            ✕
          </button>
        </div>
      )}

      {/* Image Preview */}
      {selectedImageUrl && (
        <div className="mb-3 relative">
          <div className="inline-block relative">
            <img
              src={selectedImageUrl}
              alt="Selected"
              className="max-h-32 rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={() => setSelectedImageUrl(null)}
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg flex gap-2 flex-wrap animate-fadeIn">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleEmojiClick(emoji)}
              className="text-xl hover:bg-white p-2 rounded-lg transition-colors cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input Section */}
      <div className="flex gap-3 items-end">
        {/* Emoji Button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          title="Add emoji"
        >
          😊
        </button>

        {/* File Upload Button */}
        <button
          type="button"
          onClick={handleFileClick}
          disabled={uploadingImage}
          className="p-2 text-gray-600 hover:bg-gray-100 disabled:text-gray-400 rounded-lg transition-colors flex-shrink-0"
          title="Upload image"
        >
          {uploadingImage ? "📤" : "🖼️"}
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />

        {/* Message Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !disabled && !isLoading && !uploadingImage) {
              e.preventDefault();
              const form = e.currentTarget.form;
              form?.dispatchEvent(
                new Event("submit", { bubbles: true, cancelable: true })
              );
            }
          }}
          placeholder={selectedImageUrl ? "Add a message with your image..." : "Type your message…"}
          disabled={disabled || isLoading || uploadingImage}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 transition-all"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={disabled || isLoading || uploadingImage || (!value.trim() && !selectedImageUrl)}
          className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors font-medium flex-shrink-0 flex items-center gap-2"
          title="Send message (Enter)"
        >
          {isLoading || uploadingImage ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="hidden sm:inline">{uploadingImage ? "Uploading..." : "Sending..."}</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z" />
              </svg>
              <span className="hidden sm:inline">Send</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
