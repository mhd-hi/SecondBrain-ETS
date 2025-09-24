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
      className="group relative inline-flex items-center justify-center"
      title={item.title}
    >
      {item.imageUrl && !imageError
        ? (
          <>
            {imageLoading && (
              <div className="w-8 h-8 bg-muted/50 rounded animate-pulse" />
            )}
            <Image
              src={item.imageUrl}
              alt={`${item.title} icon`}
              width={32}
              height={32}
              className={`object-contain transition-all duration-200 hover:scale-110 opacity-80 hover:opacity-100 ${imageLoading ? 'opacity-0' : ''}`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
              priority={false}
              sizes="32px"
            />
          </>
        )
        : (
          <div className="w-8 h-8 bg-muted/50 rounded flex items-center justify-center text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            {item.type.charAt(0).toUpperCase()}
          </div>
        )}
    </Link>
  );
}
