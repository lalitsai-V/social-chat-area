"use client";

import { useState, FormEvent, useRef } from "react";
import { imageUploadService } from "@/lib/imageUpload/service";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (
    e: FormEvent<HTMLFormElement>,
    imageUrl?: string,
    attachmentType?: "image" | "document"
  ) => void;
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
  const [selectedAttachmentType, setSelectedAttachmentType] = useState<
    "image" | "document" | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emojis = ["😀", "😂", "😍", "🤔", "👍", "🎉", "🚀", "✨"];

  const handleEmojiClick = (emoji: string) => {
    onChange(value + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileClick = () => {
    setSelectedAttachmentType(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    try {
      setUploadingImage(true);
      // Support images and PDFs (documents)
      if (file.type.startsWith("image/")) {
        const imageUrl = await imageUploadService.uploadImage(file, userId);
        if (imageUrl) {
          setSelectedImageUrl(imageUrl);
          setSelectedAttachmentType("image");
          console.log("✅ Image ready to send:", imageUrl);
        }
      } else if (file.type === "application/pdf") {
        const docUrl = await imageUploadService.uploadDocument(file, userId);
        if (docUrl) {
          setSelectedImageUrl(docUrl);
          setSelectedAttachmentType("document");
          console.log("✅ Document ready to send:", docUrl);
        }
      } else {
        alert("Unsupported file type. Please select an image or PDF document.");
      }
    } catch (err) {
      console.error("❌ Image upload failed:", err);
      alert(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    onSend(
      e,
      selectedImageUrl || undefined,
      selectedAttachmentType || undefined
    );
    setSelectedImageUrl(null);
    setSelectedAttachmentType(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky bottom-0 bg-white border-t border-slate-200 p-4 shadow-lg space-y-3"
    >
      {/* Replying to Indicator */}
      {replyingTo && (
        <div className="px-4 py-3 bg-blue-600 border-l-4 border-blue-700 rounded-lg flex justify-between items-start animate-slideInUp">
          <div className="flex-1">
            <p className="text-xs font-semibold text-white mb-1">
              ↳ Replying to {replyingTo.user_email?.split("@")[0]}
            </p>
            <p className="text-sm text-blue-50 truncate">{replyingTo.content}</p>
          </div>
          <button
            type="button"
            onClick={onClearReply}
            className="ml-2 text-white hover:text-blue-100 hover:bg-blue-700 rounded p-1 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Attachment Preview */}
      {selectedImageUrl && (
        <div className="px-1">
          <div className="inline-block relative animate-scaleIn">
            {selectedAttachmentType === "image" ? (
              <>
                <img
                  src={selectedImageUrl}
                  alt="Selected"
                  className="max-h-40 rounded-lg border-2 border-blue-200 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImageUrl(null);
                    setSelectedAttachmentType(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-all shadow-lg"
                >
                  ✕
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-8 h-8 bg-red-50 text-red-600 rounded flex items-center justify-center font-bold">
                  PDF
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{selectedImageUrl.split("/").pop()}</p>
                  <p className="text-xs text-slate-500">PDF document ready to send</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImageUrl(null);
                    setSelectedAttachmentType(null);
                  }}
                  className="ml-2 text-slate-500 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="px-1 py-2 bg-slate-100 rounded-lg flex gap-2 flex-wrap animate-slideDown border border-slate-200">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleEmojiClick(emoji)}
              className="text-xl hover:bg-white p-2 rounded-lg transition-all cursor-pointer hover:scale-110"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input Section */}
      <div className="flex gap-1 sm:gap-2 items-end">
        {/* Emoji Button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 sm:p-2.5 text-slate-600 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-all flex-shrink-0 text-sm sm:text-base"
          title="Add emoji"
        >
          😊
        </button>

        {/* File Upload Button */}
        <button
          type="button"
          onClick={handleFileClick}
          disabled={uploadingImage}
          className="p-2 sm:p-2.5 text-slate-600 hover:bg-blue-100 hover:text-blue-600 disabled:text-slate-400 rounded-lg transition-all flex-shrink-0 text-sm sm:text-base"
          title="Upload file (image or PDF)"
        >
          {uploadingImage ? "📤" : "�️"}
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,application/pdf"
        />

        {/* Message Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !disabled &&
              !isLoading &&
              !uploadingImage
            ) {
              e.preventDefault();
              const form = e.currentTarget.form;
              form?.dispatchEvent(
                new Event("submit", { bubbles: true, cancelable: true })
              );
            }
          }}
          placeholder={selectedImageUrl ? "Add a message with your image..." : "Type your message…"}
          disabled={disabled || isLoading || uploadingImage}
          className="flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100 disabled:text-slate-500 transition-all text-slate-900 placeholder-slate-500 text-sm sm:text-base"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={
            disabled || isLoading || uploadingImage || (!value.trim() && !selectedImageUrl)
          }
          className="px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all font-semibold flex-shrink-0 flex items-center gap-1 sm:gap-2 shadow-md hover:shadow-lg text-sm sm:text-base whitespace-nowrap"
          title="Send message (Enter)"
        >
          {isLoading || uploadingImage ? (
            <>
              <span className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="hidden sm:inline text-xs sm:text-sm">{uploadingImage ? "Uploading..." : "Sending..."}</span>
            </>
          ) : (
            <>
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z" />
              </svg>
              <span className="hidden sm:inline text-xs sm:text-sm">Send</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
