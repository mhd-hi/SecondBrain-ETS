'use client';

import type { CustomLink as LinkType } from '@/types/custom-link';

import Image from 'next/image';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { DEFAULT_IMAGES, validateUrl } from '@/lib/utils/url-util';
import { LINK_TYPES } from '@/types/custom-link';

export default function CustomLinkForm({ onCreate, initialCourseId }: { onCreate: (data: { title: string; url: string; type: LinkType; imageUrl?: string | null; courseId?: string | null }) => Promise<void>; initialCourseId?: string }) {
  const [title, setTitle] = useState<string>(LINK_TYPES.MOODLE);
  const [url, setUrl] = useState('');
  const [type, setType] = useState<LinkType>(LINK_TYPES.MOODLE);
  const [imageUrl, setImageUrl] = useState<string | null>(DEFAULT_IMAGES[LINK_TYPES.MOODLE]);
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
      await onCreate({ title, url, type, imageUrl: imageUrl ?? null, courseId: initialCourseId ?? null });
      setTitle(LINK_TYPES.MOODLE);
      setType(LINK_TYPES.MOODLE);
      setUrl('');
      setImageUrl(DEFAULT_IMAGES[LINK_TYPES.MOODLE]);
    } catch (err) {
      setError((err as Error).message ?? 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const selectPreset = (t: LinkType) => {
    setType(t);
    setImageUrl(DEFAULT_IMAGES[t]);

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
        <div className="flex items-end gap-2">
            <div className="flex-shrink-0">
                <label htmlFor="link-type-trigger" className="block text-sm font-medium mb-1">Title</label>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="secondary" type="button" id="link-type-trigger" className="inline-flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                        <span className="flex items-center gap-2">
                          <Image src={DEFAULT_IMAGES[type]} alt={type} width={20} height={20} className="rounded" />
                        </span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                    {(Object.keys(DEFAULT_IMAGES) as LinkType[]).map((t) => {
                        return (
                        <DropdownMenuItem
                          key={t}
                          onClick={() => selectPreset(t)}
                          className="flex items-center gap-2"
                        >
                            <Image src={DEFAULT_IMAGES[t]} alt={t} width={20} height={20} className="rounded" />
                            <span className="capitalize">{t}</span>
                        </DropdownMenuItem>
                        );
                    })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex-1">
                <Input
                  id="link-title"
                  placeholder="Enter link title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                  }}
                  disabled={type !== LINK_TYPES.CUSTOM}
                  className={type !== LINK_TYPES.CUSTOM ? 'text-muted-foreground bg-muted cursor-not-allowed' : ''}
                />
            </div>
        </div>
        <div className="space-y-3">

            <div>
                <label htmlFor="link-url" className="block text-sm font-medium mb-1">URL</label>
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
