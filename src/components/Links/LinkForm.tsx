'use client';

import type { Link as LinkType } from '@/types/link';

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

const PRESET_IMAGES: Record<LinkType, string> = {
  PlanETS: '/assets/logo_planets.png',
  Moodle: '/assets/moodle.png',
  NotebookLM: '/assets/notebooklm.png',
  Spotify: '/assets/spotify.png',
  Youtube: '/assets/youtube.webp',
  custom: '/assets/pochita.webp',
};

export default function LinkForm({ onCreate, initialCourseId }: { onCreate: (data: { title: string; url: string; type: LinkType; imageUrl?: string | null; courseId?: string | null }) => Promise<void>; initialCourseId?: string }) {
  const [title, setTitle] = useState('Moodle');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<LinkType>('Moodle');
  const [imageUrl, setImageUrl] = useState<string | null>(PRESET_IMAGES.Moodle);
  const [isTitleEdited, setIsTitleEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title || !url) {
      setError('Title and URL required');
      return;
    }
    try {
      setLoading(true);
      await onCreate({ title, url, type, imageUrl: imageUrl ?? null, courseId: initialCourseId ?? null });
      setTitle('Moodle');
      setType('Moodle');
      setUrl('');
      setImageUrl(PRESET_IMAGES.Moodle);
      setIsTitleEdited(false);
    } catch (err) {
      setError((err as Error).message ?? 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const selectPreset = (t: LinkType) => {
    setType(t);
    setImageUrl(PRESET_IMAGES[t]);
    // Auto-set title based on type unless user already edited it
    if (!isTitleEdited) {
      // For custom type leave title empty so user can enter one
      if (t === 'custom') {
        setTitle('');
      } else {
        setTitle(t);
      }
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
                          <Image src={PRESET_IMAGES[type]} alt={type} width={20} height={20} className="rounded" />
                        </span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                    {(Object.keys(PRESET_IMAGES) as LinkType[]).map((t) => {
                        return (
                        <DropdownMenuItem
                          key={t}
                          onClick={() => selectPreset(t)}
                          className="flex items-center gap-2"
                        >
                            <Image src={PRESET_IMAGES[t]} alt={t} width={20} height={20} className="rounded" />
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
                    setIsTitleEdited(true);
                }}
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
