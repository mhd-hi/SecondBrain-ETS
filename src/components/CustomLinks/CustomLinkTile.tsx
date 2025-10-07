'use client';

import type { CustomLinkItem } from '@/types/custom-link';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

type CustomLinkTileProps = {
  item: CustomLinkItem;
  onDelete?: (id: string) => void;
};

export default function CustomLinkTile({ item, onDelete: _onDelete }: CustomLinkTileProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative inline-flex items-center justify-center w-8 h-8"
      title={item.title}
    >
      {item.imageUrl && !imageError
        ? (
          <div className="relative w-8 h-8">
            {/* Skeleton - always present to maintain layout */}
            <div className={`absolute inset-0 bg-muted/50 rounded transition-opacity duration-200 ${imageLoading ? 'opacity-100 animate-pulse' : 'opacity-0'}`} />
            <Image
              src={item.imageUrl}
              alt={`${item.title} icon`}
              width={32}
              height={32}
              className={`absolute inset-0 w-full h-full object-contain transition-all duration-200 hover:scale-110 ${imageLoading ? 'opacity-0' : 'opacity-80 hover:opacity-100'}`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
              priority={false}
              sizes="32px"
            />
          </div>
        )
        : (
          <div className="w-8 h-8 bg-muted/50 rounded flex items-center justify-center text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            {item.type.charAt(0).toUpperCase()}
          </div>
        )}
    </Link>
  );
}
