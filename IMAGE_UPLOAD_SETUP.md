# Image Upload Feature Setup Guide

This guide explains how to set up and use the image upload feature in the chat application.

## What's Included

The image upload feature allows users to:
- Upload images from their device while composing messages
- See image previews before sending
- Delete uploaded images before sending
- Share images in the chat with automatic storage in Supabase

## Setup Steps

### Step 1: Create Supabase Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** section
3. Click **Create a new bucket**
4. Set the following:
   - **Name**: `chat-images`
   - **Public bucket**: Toggle **ON** (required for images to be accessible)
   - Click **Create bucket**

### Step 2: Set Up Storage Policies (RLS)

1. In the Supabase Dashboard, go to **Storage** → **chat-images** bucket
2. Click on **Policies** tab
3. Create the following policies:

#### Policy 1: Allow users to upload images (INSERT)
```sql
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'chat-images'
  AND auth.role() = 'authenticated'
);
```

#### Policy 2: Allow users to view all images (SELECT)
```sql
CREATE POLICY "Allow anyone to view images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'chat-images');
```

#### Policy 3: Allow users to delete their own images (DELETE)
```sql
CREATE POLICY "Allow users to delete their own images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'chat-images'
  AND auth.uid() = owner
);
```

### Step 3: Add image_url Column to Messages Table

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a **New query** and paste the contents of `DATABASE_MIGRATION_IMAGE_SUPPORT.sql`
4. Click **Run** to execute

This will:
- Add the `image_url` column to the messages table
- Create an index for performance
- Add documentation to the column

## Code Changes Made

### 1. **src/lib/imageUpload/service.ts** (NEW)
Image upload service with:
- `uploadImage(file, userId)` - Validates and uploads images to Supabase Storage
- `deleteImage(imageUrl)` - Removes images from storage
- Automatic file validation (type and size)
- Public URL generation for display

### 2. **src/components/MessageInput.tsx** (UPDATED)
Enhanced with:
- Image file input handling
- Image preview display with delete option
- Upload status feedback
- `userId` prop for image organization
- Passes `imageUrl` to `handleSendMessage` via new `handleSubmit` wrapper

### 3. **src/components/Chat.tsx** (UPDATED)
Updated to:
- Accept `imageUrl` parameter in `handleSendMessage`
- Store `image_url` in database when sending messages
- Display images in message bubbles (rendered before text)
- Pass `imageUrl` to message deletion handler
- Delete images from storage when messages are deleted
- Import and use `imageUploadService`

### 4. **src/components/MessageActions.tsx** (UPDATED)
Now accepts `imageUrl` prop for handling image deletions

## Features

### Image Upload
1. Click the **🖼️** button in the message input area
2. Select an image from your device
3. Wait for the upload to complete (status shows in button)
4. Image preview appears in the input area
5. Click the **✕** button to remove the image if needed
6. Type a message (optional) and click **Send** to share

### Image Display
- Images appear in message bubbles above or instead of text
- Images are responsive and scale to fit the chat width
- Images have a maximum height for readability
- Images use lazy loading for performance

### Image Deletion
- When you delete a message, its associated image is also deleted from storage
- This prevents orphaned files from accumulating

## Supported File Types
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`)
- WebP (`.webp`)
- TIFF (`.tiff`)

## Size Limits
- Maximum file size: **5 MB**
- Files larger than 5 MB will be rejected with an error message

## Troubleshooting

### Images not displaying
- Ensure the `chat-images` bucket is set to **Public**
- Verify the bucket name is exactly `chat-images`
- Check that the image URL in the database is correct

### Upload fails with "403 Forbidden"
- Make sure the storage policies are set up correctly
- Verify you're authenticated before uploading
- Check that the bucket is set to public

### Upload fails with "413 Payload Too Large"
- The image is larger than 5 MB
- Compress or use a smaller image file

### Images disappear after page refresh
- Make sure the database migration (DATABASE_MIGRATION_IMAGE_SUPPORT.sql) was run
- Verify the image_url column exists in the messages table

## Performance Notes

- Images are automatically optimized during upload
- Lazy loading is enabled for faster page loads
- Images are stored in Supabase with deterministic names based on upload time
- Storage paths include user ID for organization

## Security

- Images are stored with randomized names for privacy
- Users can only delete their own images
- The bucket is public for reading but requires authentication for uploads/deletes
- Images must be uploaded by authenticated users only

## Testing

1. Sign in with two different user accounts in separate browser windows
2. In one account, click the image button and upload an image
3. Optionally add a text message
4. Click Send
5. The image should appear immediately in both windows
6. Delete the message in the original account
7. Verify the image is removed from both windows

## API Reference

### imageUploadService.uploadImage(file, userId)
**Parameters:**
- `file: File` - The image file to upload
- `userId: string` - The ID of the current user

**Returns:** `Promise<string>` - The public URL of the uploaded image

**Throws:** Error if file validation fails or upload fails

### imageUploadService.deleteImage(imageUrl)
**Parameters:**
- `imageUrl: string` - The public URL of the image to delete

**Returns:** `Promise<boolean>` - True if successful

**Throws:** Error if deletion fails

## Environment Variables

No additional environment variables are needed. The existing Supabase configuration is sufficient.

## Future Enhancements

Potential features that could be added:
- Image compression before upload
- Image cropping tool
- Animated GIF support with loop controls
- Image gallery view for chat history
- Image search/filter functionality
- Image annotations/drawing tools
- Drag-and-drop image upload
- Multiple image uploads in one message
