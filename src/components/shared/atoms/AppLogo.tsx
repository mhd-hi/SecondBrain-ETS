import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';

type AppLogoProps = {
  className?: string;
};

export function AppLogo({ className }: AppLogoProps) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Button
      variant="ghost"
      asChild
      className={`font-bold text-xl ${className} ${isCollapsed ? 'w-8 h-8 p-0 justify-center' : ''}`}
    >
      <Link href="/" className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'}`}>
        <Image
          src="/assets/pochita-bread.png"
          alt="Favicon"
          width={isCollapsed ? 24 : 35}
          height={isCollapsed ? 24 : 35}
          priority={true}
          className="object-contain flex-shrink-0"
        />
        {!isCollapsed && <span>SecondBrain ETS</span>}
      </Link>
    </Button>
  );
}
