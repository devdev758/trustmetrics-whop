/**
 * Supabase Storage Utilities
 *
 * Functions for uploading and managing files in Supabase Storage
 */

import { createClient } from '@/lib/supabase/server';

const BUCKET_NAME = 'achievement-proofs';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Upload image to Supabase Storage
 *
 * @param file - File buffer or base64 string
 * @param fileName - Name for the file
 * @param mimeType - MIME type of the file
 * @returns Public URL of uploaded file
 */
export async function uploadAchievementProof(
  file: Buffer | string,
  fileName: string,
  mimeType: string
): Promise<string> {
  const supabase = await createClient();

  // Convert base64 to buffer if needed
  let fileBuffer: Buffer;
  if (typeof file === 'string') {
    // Remove data URL prefix if present
    const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
    fileBuffer = Buffer.from(base64Data, 'base64');
  } else {
    fileBuffer = file;
  }

  // Validate file size
  if (fileBuffer.length > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 5MB limit');
  }

  // Generate unique file name
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  const extension = mimeType.split('/')[1] || 'jpg';
  const uniqueFileName = `${timestamp}-${randomString}-${fileName}.${extension}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(uniqueFileName, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Delete file from Supabase Storage
 *
 * @param fileUrl - Public URL of the file
 */
export async function deleteAchievementProof(fileUrl: string): Promise<void> {
  const supabase = await createClient();

  // Extract file path from URL
  const urlParts = fileUrl.split(`${BUCKET_NAME}/`);
  if (urlParts.length < 2) {
    throw new Error('Invalid file URL');
  }

  const filePath = urlParts[1];

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    console.error('Supabase delete error:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Validate image file
 *
 * @param mimeType - MIME type to validate
 * @returns true if valid image type
 */
export function isValidImageType(mimeType: string): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(mimeType.toLowerCase());
}
