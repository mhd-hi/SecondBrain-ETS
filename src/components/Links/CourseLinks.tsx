 'use client';

import LinkTile from '@/components/Links/LinkTile';
import { useLinks } from '@/hooks/use-link';

export default function CourseLinks({ courseId, refresh }: { courseId: string; refresh: () => void }) {
  const { links, deleteLink, fetchLinks } = useLinks(courseId);

  const handleDelete = async (id: string) => {
    await deleteLink(id);
    await fetchLinks();
    refresh();
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {links.map(l => <LinkTile key={l.id} item={l} onDelete={handleDelete} />)}
      </div>
    </div>
  );
}
