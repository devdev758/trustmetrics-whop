/**
 * Badge Preview Component
 *
 * Display badge iframe and copy embed code functionality
 */

'use client';

import { useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface BadgePreviewProps {
  creatorId: string;
  creatorName: string;
}

export function BadgePreview({ creatorId, creatorName }: BadgePreviewProps) {
  const [copied, setCopied] = useState(false);

  // Get the base URL from window location
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  };

  const badgeUrl = `${getBaseUrl()}/api/badge/${creatorId}`;
  const profileUrl = `${getBaseUrl()}/profile/${creatorId}`;

  const embedCode = `<iframe src="${badgeUrl}" width="200" height="80" frameborder="0" scrolling="no" style="border: none; overflow: hidden;"></iframe>`;

  /**
   * Copy embed code to clipboard
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      toast.success('Embed code copied to clipboard!');

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy embed code');
    }
  };

  return (
    <div className="space-y-6">
      {/* Badge Preview */}
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Badge Preview
        </h2>

        <div className="mb-6 flex items-center justify-center rounded-lg bg-gray-50 p-8">
          <iframe
            src={badgeUrl}
            width="200"
            height="80"
            style={{ border: 'none', overflow: 'hidden' }}
            title={`Trust Badge for ${creatorName}`}
          />
        </div>

        <div className="flex items-center justify-center gap-4">
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ExternalLink className="h-4 w-4" />
            View Public Profile
          </a>
        </div>
      </div>

      {/* Embed Code */}
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Embed Code</h2>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              copied
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Code
              </>
            )}
          </button>
        </div>

        <div className="rounded-lg bg-gray-900 p-4">
          <code className="block overflow-x-auto text-sm text-gray-100">
            {embedCode}
          </code>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
        <h3 className="mb-3 font-semibold text-gray-900">
          How to Add to Your Whop Store
        </h3>

        <ol className="space-y-3 text-sm text-gray-700">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              1
            </span>
            <span>
              <strong>Copy the embed code</strong> above by clicking the
              &quot;Copy Code&quot; button
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              2
            </span>
            <span>
              <strong>Go to your Whop store settings</strong> and find the
              custom HTML or embed section
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              3
            </span>
            <span>
              <strong>Paste the embed code</strong> where you want your Trust
              Badge to appear
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              4
            </span>
            <span>
              <strong>Save and publish</strong> your changes. The badge will
              update automatically as your Trust Score changes!
            </span>
          </li>
        </ol>
      </div>

      {/* Tips */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-3 font-semibold text-gray-900">Badge Tips</h3>

        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-2">
            <span className="text-blue-600">•</span>
            <span>
              The badge automatically updates when your Trust Score changes
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600">•</span>
            <span>
              Clicking the badge takes visitors to your public profile page
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600">•</span>
            <span>
              Badge colors change based on your tier (Gold/Silver/Bronze)
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600">•</span>
            <span>
              The badge is responsive and works on mobile and desktop devices
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600">•</span>
            <span>Badge data is cached for 1 hour for optimal performance</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
