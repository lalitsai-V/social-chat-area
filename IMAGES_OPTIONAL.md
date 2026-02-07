# Optional: Image Upload Feature

This guide shows how to add image upload capability to the chat using Supabase Storage.

## Step 1: Create Storage Bucket

### 1.1 Create Bucket in Supabase
1. Go to **Storage** in your Supabase project
2. Click "New Bucket"
3. Name it: `chat-images`
4. Toggle off "Make it private" (leave public)
5. Click "Create Bucket"

## Step 2: Set Storage Policies

### 2.1 Configure RLS Policies
Go to **Storage** → **Policies** for `chat-images` bucket

Run this SQL in the SQL Editor:

```sql
-- Allow authenticated users to upload images
CREATE POLICY "Users can upload images" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'chat-images' AND
    auth.role() = 'authenticated'
  );

-- Allow public to view images
CREATE POLICY "Users can view images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'chat-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their images" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'chat-images' AND
    auth.uid()::text = owner
  );
```

## Step 3: Update Chat Component

Create an enhanced Chat component at `src/components/ChatWithImages.tsx`:

```typescript
"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  user_email?: string;
  image_url?: string;
}

interface ChatWithImagesProps {
  userId: string;
  userEmail: string;
}

export default function ChatWithImages({ userId, userEmail }: ChatWithImagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef(createClient());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      const supabase = supabaseRef.current;
      const { data } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(100);

      if (data) {
        setMessages(data);
        scrollToBottom();
      }
    };

    fetchMessages();

    // Subscribe to realtime
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setUploading(true);

    try {
      const supabase = supabaseRef.current;
      const timestamp = Date.now();
      const fileName = `${userId}/${timestamp}_${file.name}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("chat-images")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        alert("Failed to upload image");
        return;
      }

      // Get public URL
      const { data } = supabase.storage
        .from("chat-images")
        .getPublicUrl(fileName);

      const imageUrl = data.publicUrl;

      // Send message with image URL
      const { error: insertError } = await supabase.from("messages").insert({
        content: `[Image]`, // Placeholder or with caption
        user_id: userId,
        user_email: userEmail,
        image_url: imageUrl,
      });

      if (insertError) {
        console.error("Insert error:", insertError);
        alert("Failed to send image");
        return;
      }

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to send image");
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    setLoading(true);

    const supabase = supabaseRef.current;
    const { error } = await supabase.from("messages").insert({
      content: newMessage,
      user_id: userId,
      user_email: userEmail,
    });

    if (!error) {
      setNewMessage("");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.user_id === userId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.user_id === userId
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                {msg.user_id !== userId && (
                  <p className="text-xs font-semibold mb-1">{msg.user_email}</p>
                )}
                
                {msg.image_url && (
                  <img
                    src={msg.image_url}
                    alt="Shared image"
                    className="mb-2 max-w-xs rounded"
                  />
                )}
                
                {msg.content && <p className="break-words">{msg.content}</p>}
                
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:bg-gray-100"
          >
            📎 Image
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={loading || uploading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading || uploading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {uploading ? "Uploading..." : loading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

## Step 4: Update Dashboard to Use Images

Update `src/app/dashboard/page.tsx`:

```typescript
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/lib/auth/service";
import ChatWithImages from "@/components/ChatWithImages"; // Change this line
import { useState } from "react";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [signOutLoading, setSignOutLoading] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  const handleSignOut = async () => {
    setSignOutLoading(true);
    await authService.signOut();
    router.push("/sign-in");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Logged in as: <span className="font-medium">{user.email}</span>
            </p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signOutLoading}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition-colors"
          >
            {signOutLoading ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-96">
          <ChatWithImages userId={user.id} userEmail={user.email || ""} />
        </div>
      </div>
    </div>
  );
}
```

## Step 5: Update Database Schema

Add image_url column to messages table:

```sql
ALTER TABLE messages ADD COLUMN image_url TEXT;

-- Create index for faster queries
CREATE INDEX messages_image_url_idx ON messages(image_url);
```

## Step 6: Test Image Uploads

1. Run the app: `npm run dev`
2. Sign in to dashboard
3. Click the 📎 Image button
4. Select an image file (must be image type, < 5MB)
5. Verify image uploads and displays
6. Sign in from another browser
7. Verify image appears for other user in real-time

## Security Considerations

1. **File Validation**: Check file type and size before upload
2. **Storage Limits**: Monitor storage usage in Supabase dashboard
3. **Public URLs**: Images are publicly accessible, OK for chat
4. **Cleanup**: Consider implementing image deletion after chat is deleted
5. **Virus Scanning**: For production, integrate malware scanning

## Performance Tips

1. **Image Compression**: Compress images before upload client-side
2. **Caching**: Supabase CDN caches images automatically
3. **Thumbnails**: Generate thumbnails for faster loading
4. **Progressive Loading**: Show placeholder while loading

## Troubleshooting

### Issue: "Permission denied" on upload
**Solution:**
- Verify RLS policies are correctly set
- Check bucket is public
- Verify user is authenticated

### Issue: Image won't load
**Solution:**
- Check image_url is correct
- Verify bucket exists and is public
- Check CORS settings in Supabase

### Issue: Storage quota exceeded
**Solution:**
- Check storage usage in Supabase dashboard
- Delete old messages/images
- Upgrade Supabase plan

---

This implementation provides robust image support with security and performance considerations!
