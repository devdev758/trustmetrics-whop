/**
 * Submit Achievement Form Component
 *
 * Form for submitting achievements with image upload
 */

'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface SubmitAchievementFormProps {
  milestoneId: string;
  milestoneTitle: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function SubmitAchievementForm({
  milestoneId,
  milestoneTitle,
}: SubmitAchievementFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Please upload a JPEG, PNG, or WebP image',
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large', {
        description: 'Maximum file size is 5MB',
      });
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('Please select an image');
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;

        const response = await fetch('/api/achievements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            milestoneId,
            proofImage: base64Data,
            mimeType: selectedFile.type,
            fileName: selectedFile.name,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || result.error || 'Failed to submit achievement'
          );
        }

        toast.success('Achievement submitted!', {
          description: 'Your achievement has been submitted for verification',
        });

        // Reset form
        handleRemoveFile();

        // Refresh page
        router.refresh();
      };

      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Error submitting achievement:', error);
      toast.error('Failed to submit achievement', {
        description:
          error instanceof Error ? error.message : 'Please try again',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Submit Achievement
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Milestone Info */}
        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-sm font-medium text-blue-900">
            Milestone: {milestoneTitle}
          </p>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Proof Image <span className="text-red-500">*</span>
          </label>
          <p className="mt-1 text-xs text-gray-500">
            Upload an image showing your achievement (max 5MB)
          </p>

          {!previewUrl ? (
            <div className="mt-2">
              <label
                htmlFor="file-upload"
                className={cn(
                  'flex cursor-pointer flex-col items-center justify-center',
                  'rounded-lg border-2 border-dashed border-gray-300',
                  'bg-gray-50 px-6 py-8 hover:bg-gray-100',
                  'transition-colors'
                )}
              >
                <Upload className="mb-2 h-10 w-10 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">
                  Click to upload
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  JPEG, PNG or WebP (max 5MB)
                </p>
              </label>
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="mt-2 relative">
              <div className="relative overflow-hidden rounded-lg border border-gray-200">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-64 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className={cn(
                    'absolute right-2 top-2 rounded-full bg-red-600 p-1.5',
                    'text-white hover:bg-red-700'
                  )}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-600">
                {selectedFile?.name} (
                {(selectedFile!.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!selectedFile || isSubmitting}
          className={cn(
            'inline-flex w-full items-center justify-center gap-2',
            'rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white',
            'hover:bg-blue-700 focus:outline-none focus:ring-2',
            'focus:ring-blue-500 focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          <ImageIcon className="h-4 w-4" />
          {isSubmitting ? 'Submitting...' : 'Submit Achievement'}
        </button>
      </form>
    </div>
  );
}
