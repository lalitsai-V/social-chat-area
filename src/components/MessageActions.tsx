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
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          autoFocus
        />
        <button
          onClick={handleEdit}
          className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
        >
          Save
        </button>
        <button
          onClick={handleCancel}
          className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition-colors"
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
        className="text-gray-500 hover:text-gray-700 text-xs transition-colors"
      >
        ⋯
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 animate-fadeIn">
          <button
            onClick={() => {
              onReply?.();
              setShowMenu(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors first:rounded-t-lg"
          >
            ↩ Reply
          </button>
          {isOwner && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                ✎ Edit
              </button>
              <button
                onClick={() => {
                  onDelete?.();
                  setShowMenu(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors last:rounded-b-lg"
              >
                🗑 Delete
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
