'use client';

import type { CustomLink as LinkType } from '@/types/custom-link';

import * as React from 'react';
import { useState } from 'react';
import LinkFields from '@/components/CustomLinks/LinkFields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { normalizeUrl, validateUrl } from '@/lib/utils/url-util';
import { LINK_TYPES } from '@/types/custom-link';

export default function CustomLinkForm({ onCreate, initialCourseId }: { onCreate: (data: { title: string; url: string; type: LinkType; courseId?: string | null }) => Promise<void>; initialCourseId?: string }) {
  const [title, setTitle] = useState<string>(LINK_TYPES.MOODLE);
  const [url, setUrl] = useState('');
  const [type, setType] = useState<LinkType>(LINK_TYPES.MOODLE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !url) {
      setError('Title and URL required');
      return;
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid URL');
      return;
    }

    try {
      setLoading(true);
      await onCreate({ title, url: normalizeUrl(url), type, courseId: initialCourseId ?? null });
      setTitle(LINK_TYPES.MOODLE);
      setType(LINK_TYPES.MOODLE);
      setUrl('');
    } catch (err) {
      setError((err as Error).message ?? 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const selectPreset = (t: LinkType) => {
    setType(t);

    // For recognized types, always set the title to the type name and disable editing
    if (t === LINK_TYPES.CUSTOM) {
      // For custom type, clear title and allow editing
      setTitle('');
    } else {
      // For recognized types, set title to type name and mark as not user-edited
      setTitle(t);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
        <LinkFields
          title={title}
          onTitleChange={v => setTitle(v)}
          type={type}
          onTypeSelect={t => selectPreset(t)}
        />
        <div className="space-y-3">

            <div>
                <Input id="link-url" placeholder="Enter URL" value={url} onChange={e => setUrl(e.target.value)} />
            </div>
        </div>
        {error && <div className="text-sm text-red-500">{error}</div>}
        <div className="flex justify-end">
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
        </div>
    </form>
  );
}
