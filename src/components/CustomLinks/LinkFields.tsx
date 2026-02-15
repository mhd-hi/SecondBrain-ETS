'use client';

import type { CustomLink as LinkType } from '@/types/custom-link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { getDefaultImageFor } from '@/lib/utils/url-util';
import { LINK_TYPES } from '@/types/custom-link';

type LinkFieldsProps = {
  title: string;
  onTitleChange: (v: string) => void;
  type: LinkType;
  onTypeSelect: (t: LinkType) => void;
  id?: string;
  className?: string;
};

export default function LinkFields({ title, onTitleChange, type, onTypeSelect, id, className }: LinkFieldsProps) {
  return (
    <div className={className}>
      <div className="flex items-end gap-2">
        <div className="shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" type="button" id={id ?? 'link-type-trigger'} className="inline-flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 relative">
                    <Image src={getDefaultImageFor(type)} fill alt={type} className="rounded object-contain" sizes="20px" />
                  </div>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {(Object.values(LINK_TYPES) as LinkType[]).map(t => (
                <DropdownMenuItem
                  key={t}
                  onClick={() => onTypeSelect(t)}
                  className="flex items-center gap-2"
                >
                  <div className="w-5 h-5 relative">
                    <Image src={getDefaultImageFor(t)} fill alt={t} className="rounded object-contain" sizes="20px" />
                  </div>
                  <span className="capitalize">{t}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-1">
          <Input
            id={id ? `${id}-title` : 'link-title'}
            placeholder="Enter link title"
            value={title}
            onChange={e => onTitleChange(e.target.value)}
            disabled={type !== LINK_TYPES.CUSTOM}
            className={type !== LINK_TYPES.CUSTOM ? 'text-muted-foreground bg-muted cursor-not-allowed' : ''}
          />
        </div>
      </div>
    </div>
  );
}
