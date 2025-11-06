# Supabase Storage Setup Guide

This guide explains how to set up Supabase Storage for achievement proof images.

## Storage Bucket Configuration

### 1. Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the sidebar
3. Click **"New bucket"**
4. Configure the bucket:
   - **Name**: `achievement-proofs`
   - **Public**: ✅ Enabled (for public read access)
   - **File size limit**: 5 MB
   - **Allowed MIME types**: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`

### 2. Set Storage Policies

Navigate to the **Policies** tab for the `achievement-proofs` bucket and create the following policies:

#### Policy 1: Public Read Access

```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'achievement-proofs');
```

#### Policy 2: Authenticated Upload

```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'achievement-proofs');
```

#### Policy 3: Authenticated Delete (Optional)

```sql
CREATE POLICY "Authenticated users can delete own uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'achievement-proofs');
```

### 3. Configure Bucket Settings

In the bucket settings, configure:

- **File Size Limit**: 5 MB (5242880 bytes)
- **Allowed MIME Types**:
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/webp`

## Using the Storage in Your Application

### Upload File Example

```typescript
import { uploadAchievementProof } from '@/lib/supabase/storage';

// Upload from file buffer
const fileBuffer = await file.arrayBuffer();
const url = await uploadAchievementProof(
  Buffer.from(fileBuffer),
  'achievement.jpg',
  'image/jpeg'
);

// Upload from base64
const base64Data = 'data:image/jpeg;base64,...';
const url = await uploadAchievementProof(
  base64Data,
  'achievement.jpg',
  'image/jpeg'
);
```

### Delete File Example

```typescript
import { deleteAchievementProof } from '@/lib/supabase/storage';

const fileUrl =
  'https://...supabase.co/storage/v1/object/public/achievement-proofs/...';
await deleteAchievementProof(fileUrl);
```

## Security Considerations

1. **File Size Validation**:
   - Client-side: Max 5MB enforced in form
   - Server-side: Validated before upload in storage utility

2. **File Type Validation**:
   - Only image types allowed: JPEG, PNG, WebP
   - Validated using `isValidImageType()` function

3. **Authentication**:
   - Uploads require authenticated session
   - API endpoints verify user authentication

4. **Unique Filenames**:
   - Files are renamed with timestamp and random string
   - Prevents filename collisions
   - Format: `{timestamp}-{random}-{original}.{ext}`

## Public URL Structure

Uploaded files are accessible via public URLs:

```
https://[project-ref].supabase.co/storage/v1/object/public/achievement-proofs/[filename]
```

Example:

```
https://abcdefgh.supabase.co/storage/v1/object/public/achievement-proofs/1234567890-abc123-proof.jpg
```

## Troubleshooting

### Upload Fails with "403 Forbidden"

- Check that the bucket policies are correctly set
- Verify user is authenticated
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in environment variables

### Images Don't Load

- Verify bucket is set to **Public**
- Check that the public URL is correct
- Ensure CORS is configured if accessing from different domain

### File Size Errors

- Check file size is under 5MB
- Verify file size limit is set correctly in bucket settings

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Testing the Setup

1. Navigate to `/dashboard/milestones/[id]`
2. Click on a milestone to view details
3. Upload a test image in the achievement submission form
4. Verify:
   - ✅ Upload completes successfully
   - ✅ Image appears in achievements feed
   - ✅ Image is clickable and enlargeable
   - ✅ Public URL is accessible

## Maintenance

### Cleaning Up Old Files

To prevent storage bloat, consider implementing:

1. **Automatic cleanup** of unverified achievements after X days
2. **Image optimization** before upload (client-side)
3. **Periodic audit** of storage usage

Example cleanup query (Prisma):

```typescript
// Delete achievements older than 90 days without verification
const oldUnverified = await prisma.achievement.findMany({
  where: {
    verified: false,
    createdAt: {
      lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    },
  },
});

// Delete associated files from storage
for (const achievement of oldUnverified) {
  if (achievement.proofUrl) {
    await deleteAchievementProof(achievement.proofUrl);
  }
}

// Delete records from database
await prisma.achievement.deleteMany({
  where: {
    id: { in: oldUnverified.map(a => a.id) },
  },
});
```
