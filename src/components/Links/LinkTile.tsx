'use client';

import type { LinkItem } from '@/types/link';
import Image from 'next/image';
import Link from 'next/link';

export default function LinkTile({ item, onDelete }: { item: LinkItem; onDelete?: (id: string) => void }) {
  const normalizeUrl = (u: string) => {
    if (/^https?:\/\//i.test(u)) {
      return u;
    }

    // If the URL looks like domain/path, prepend https://
    return `https://${u}`;
  };

  const href = normalizeUrl(item.url);

  return (
    <div className="p-2 border rounded flex items-center gap-3">
      <div className="w-8 h-8 relative flex-shrink-0">
        {item.imageUrl && (
          <Image src={item.imageUrl} alt="" aria-hidden="true" fill className="object-contain" />
        )}
      </div>
      <div className="flex-1">
        <Link href={href} target="_blank" rel="noopener noreferrer" className="block font-medium">
          {item.title}
        </Link>
        <div className="text-xs text-muted-foreground">{item.type}</div>
      </div>
      {onDelete && (
        <button type="button" className="text-sm text-red-500" onClick={() => onDelete(item.id)} aria-label={`Delete ${item.title}`}>
          Delete
        </button>
      )}
    </div>
  );
}
