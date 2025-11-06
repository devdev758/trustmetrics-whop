/**
 * Create Milestone Form Component
 *
 * Form for creating new milestones
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Plus, X } from 'lucide-react';

const milestoneSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  category: z.enum(['engagement', 'revenue', 'retention', 'community'], {
    required_error: 'Please select a category',
  }),
});

type MilestoneFormData = z.infer<typeof milestoneSchema>;

const CATEGORIES = [
  { value: 'engagement', label: 'Engagement' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'retention', label: 'Retention' },
  { value: 'community', label: 'Community' },
] as const;

export function CreateMilestoneForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneSchema),
  });

  const onSubmit = async (data: MilestoneFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/milestones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to create milestone');
      }

      toast.success('Milestone created successfully!', {
        description: `"${data.title}" has been added to your milestones.`,
      });

      reset();
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error creating milestone:', error);
      toast.error('Failed to create milestone', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg bg-blue-600',
          'px-4 py-2 text-sm font-medium text-white',
          'hover:bg-blue-700 focus:outline-none focus:ring-2',
          'focus:ring-blue-500 focus:ring-offset-2'
        )}
      >
        <Plus className="h-4 w-4" />
        Create Milestone
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Create New Milestone
        </h3>
        <button
          onClick={() => {
            setIsOpen(false);
            reset();
          }}
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title <span className="text-red-500">*</span>
          </label>
          <input
            {...register('title')}
            type="text"
            id="title"
            placeholder="e.g., First 100 Members"
            className={cn(
              'mt-1 block w-full rounded-lg border border-gray-300',
              'px-3 py-2 text-sm placeholder-gray-400',
              'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
              errors.title && 'border-red-500'
            )}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            {...register('description')}
            id="description"
            rows={3}
            placeholder="Describe what members need to achieve..."
            className={cn(
              'mt-1 block w-full rounded-lg border border-gray-300',
              'px-3 py-2 text-sm placeholder-gray-400',
              'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
              errors.description && 'border-red-500'
            )}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Category <span className="text-red-500">*</span>
          </label>
          <select
            {...register('category')}
            id="category"
            className={cn(
              'mt-1 block w-full rounded-lg border border-gray-300',
              'px-3 py-2 text-sm',
              'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
              errors.category && 'border-red-500'
            )}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">
              {errors.category.message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg bg-blue-600',
              'px-4 py-2 text-sm font-medium text-white',
              'hover:bg-blue-700 focus:outline-none focus:ring-2',
              'focus:ring-blue-500 focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            {isSubmitting ? 'Creating...' : 'Create Milestone'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              reset();
            }}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
