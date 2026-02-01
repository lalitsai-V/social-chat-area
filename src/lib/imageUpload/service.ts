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
};
