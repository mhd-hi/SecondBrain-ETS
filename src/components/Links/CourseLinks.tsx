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
};

export default function CourseLinks({ courseId, links: propLinks }: CourseLinksProps) {
  const { links: hookLinks } = useCustomLink(courseId);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Use prop links if provided, otherwise fall back to hook
  const links = propLinks ?? hookLinks;

  const hasLinks = links.length > 0;

  return (
    <>
      <div className="rounded-lg flex flex-col">
        <div className="flex-1">
          <div className="space-y-4">
            {hasLinks && (
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

                  {/* Plus button - shows on hover */}
                  <button
                    type="button"
                    onClick={() => setShowAddDialog(true)}
                    className="w-8 h-8 bg-muted/50 hover:bg-muted rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-200 opacity-0 group-hover/container:opacity-100"
                    title="Add new link"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            )}
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
          // Links will be refreshed automatically by the hook
        }}
      />
    </>
  );
}
