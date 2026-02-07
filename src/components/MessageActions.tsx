"use client";

import { useState, useRef, useEffect } from "react";

interface MessageActionsProps {
  messageId: string;
  isOwner: boolean;
  onEdit?: (newContent: string) => void;
  onDelete?: () => void;
  onReply?: () => void;
  currentContent: string;
  imageUrl?: string;
}

export default function MessageActions({
  messageId,
  isOwner,
  onEdit,
  onDelete,
  onReply,
  currentContent,
  imageUrl,
}: MessageActionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(currentContent);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  const handleEdit = () => {
    if (onEdit && editContent.trim()) {
      onEdit(editContent);
      setIsEditing(false);
      setShowMenu(false);
    }
  };

  const handleCancel = () => {
    setEditContent(currentContent);
    setIsEditing(false);
  };

  if (!isOwner) {
    return null;
  }

  if (isEditing) {
    return (
      <div className="flex gap-2 mt-2 animate-slideDown">
        <input
          type="text"
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-slate-900"
          autoFocus
        />
        <button
          onClick={handleEdit}
          className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold"
        >
          Save
        </button>
        <button
          onClick={handleCancel}
          className="px-3 py-1.5 bg-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-300 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="text-white hover:text-blue-300 text-lg transition-colors"
      >
        ⋯
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-10 animate-scaleIn min-w-max">
          <button
            onClick={() => {
              onReply?.();
              setShowMenu(false);
            }}
            className="block w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-600 hover:text-white transition-colors first:rounded-t-lg font-medium"
          >
            ↩️ Reply
          </button>
          {isOwner && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="block w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-600 hover:text-white transition-colors font-medium"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => {
                  onDelete?.();
                  setShowMenu(false);
                }}
                className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors last:rounded-b-lg font-medium"
              >
                🗑️ Delete
              </button>
            </>
          )}
          {!isOwner && (
            <div />
          )}
        </div>
      )}
    </div>
  );
}
