'use client';

import type { CustomLinkItem } from '@/types/custom-link';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import CustomLinkTile from '@/components/Links/CustomLinkTile';
import AddCustomLinkDialog from '@/components/shared/dialogs/AddCustomLinkDialog';
import { useCustomLink } from '@/hooks/use-custom-link';

type CourseLinksProps = {
  courseId: string;
  links?: CustomLinkItem[];
  onLinksChange?: () => void; // Callback to refresh links from parent
};

export default function CourseLinks({ courseId, links: propLinks, onLinksChange }: CourseLinksProps) {
  // Only use the hook when no prop links are provided (fallback)
  const { links: hookLinks } = useCustomLink(propLinks ? undefined : courseId);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Use prop links if provided, otherwise fall back to hook
  const links = propLinks ?? hookLinks;

  const hasLinks = links.length > 0;

  return (
    <>
      <div className="rounded-lg flex flex-col">
        <div className="flex-1">
          <div className="space-y-4">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Links</h3>
              </div>

              {/* All links container with compact icon-only layout */}
              <div className="group/container flex flex-wrap gap-4 relative">
                {links.map(l => (
                  <CustomLinkTile
                    key={l.id}
                    item={l}
                  />
                ))}

                {/* Plus button - shows on hover when there are links, always visible when there are no links */}
                <button
                  type="button"
                  onClick={() => setShowAddDialog(true)}
                  className={`w-8 h-8 bg-muted/50 hover:bg-muted rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-200 ${
                    hasLinks ? 'opacity-0 group-hover/container:opacity-100' : 'opacity-100'
                  }`}
                  title="Add new link"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Link Dialog */}
      <AddCustomLinkDialog
        courseId={courseId}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onLinkCreated={() => {
          setShowAddDialog(false);
          // If we have a callback to refresh, use it, otherwise the hook will handle it
          if (onLinksChange) {
            onLinksChange();
          }
        }}
      />
    </>
  );
}
