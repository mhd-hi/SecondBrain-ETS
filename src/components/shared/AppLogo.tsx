import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type AppLogoProps = {
  className?: string;
};

export function AppLogo({ className }: AppLogoProps) {
  return (
    <Button variant="ghost" asChild className={`font-bold text-xl ${className}`}>
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/assets/pochita-bread.png"
          alt="Favicon"
          width={39}
          height={39}
          priority={true}
          className="object-contain"
        />
        Second Brain
      </Link>
    </Button>
  );
}
