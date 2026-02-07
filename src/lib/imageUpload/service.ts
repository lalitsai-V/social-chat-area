import { createClient } from "@/lib/supabase/client";

export const imageUploadService = {
  async uploadImage(file: File, userId: string): Promise<string | null> {
    if (!file.type.startsWith("image/")) {
      throw new Error("Please select an image file");
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("Image size must be less than 5MB");
    }

    try {
      const supabase = createClient();
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).slice(2, 9);
      const fileName = `${userId}/${timestamp}-${randomStr}-${file.name}`;

      console.log("📤 Uploading image:", fileName);

      const { error: uploadError, data } = await supabase.storage
        .from("chat-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("❌ Upload error:", uploadError);
        throw new Error("Failed to upload image: " + uploadError.message);
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from("chat-images")
        .getPublicUrl(fileName);

      console.log("✅ Image uploaded successfully:", publicUrlData.publicUrl);
      return publicUrlData.publicUrl;
    } catch (err) {
      console.error("❌ Exception uploading image:", err);
      throw err;
    }
  },

  async uploadDocument(file: File, userId: string): Promise<string | null> {
    if (file.type !== "application/pdf") {
      throw new Error("Please select a PDF document");
    }

    const maxSize = 10 * 1024 * 1024; // 10MB for documents
    if (file.size > maxSize) {
      throw new Error("Document size must be less than 10MB");
    }

    try {
      const supabase = createClient();
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).slice(2, 9);
      const fileName = `${userId}/${timestamp}-${randomStr}-${file.name}`;

      console.log("📤 Uploading document:", fileName);

      const { error: uploadError } = await supabase.storage
        .from("chat-documents")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("❌ Upload error:", uploadError);
        // If the documents bucket is not found, attempt a best-effort fallback
        const msg = (uploadError.message || "").toLowerCase();
        if (msg.includes("bucket not found") || msg.includes("not found")) {
          try {
            console.warn("📦 'chat-documents' bucket missing — falling back to 'chat-images'");
            const { error: fallbackError } = await supabase.storage
              .from("chat-images")
              .upload(fileName, file, { cacheControl: "3600", upsert: false });

            if (fallbackError) {
              console.error("❌ Fallback upload error:", fallbackError);
              throw new Error("Failed to upload document: " + fallbackError.message);
            }

            const { data: publicUrlData } = supabase.storage
              .from("chat-images")
              .getPublicUrl(fileName);

            console.log("✅ Document uploaded to fallback bucket (chat-images):", publicUrlData.publicUrl);
            return publicUrlData.publicUrl;
          } catch (err) {
            console.error("❌ Fallback upload failed:", err);
            throw new Error("Failed to upload document: " + (err instanceof Error ? err.message : String(err)));
          }
        }

        throw new Error("Failed to upload document: " + uploadError.message);
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from("chat-documents")
        .getPublicUrl(fileName);

      console.log("✅ Document uploaded successfully:", publicUrlData.publicUrl);
      return publicUrlData.publicUrl;
    } catch (err) {
      console.error("❌ Exception uploading document:", err);
      throw err;
    }
  },

  async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      const supabase = createClient();
      // Extract file path from URL
      const urlParts = imageUrl.split("/");
      const filePath = urlParts.slice(-2).join("/");

      console.log("🗑️ Deleting image:", filePath);

      const { error } = await supabase.storage
        .from("chat-images")
        .remove([filePath]);

      if (error) {
        console.error("❌ Delete error:", error);
        return false;
      }

      console.log("✅ Image deleted successfully");
      return true;
    } catch (err) {
      console.error("❌ Exception deleting image:", err);
      return false;
    }
  },
  async deleteDocument(documentUrl: string): Promise<boolean> {
    try {
      const supabase = createClient();
      const urlParts = documentUrl.split("/");
      const filePath = urlParts.slice(-2).join("/");

      console.log("🗑️ Deleting document:", filePath);

      const { error } = await supabase.storage
        .from("chat-documents")
        .remove([filePath]);

      if (error) {
        console.error("❌ Delete error:", error);
        return false;
      }

      console.log("✅ Document deleted successfully");
      return true;
    } catch (err) {
      console.error("❌ Exception deleting document:", err);
      return false;
    }
  },
};
