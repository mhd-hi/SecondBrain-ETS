'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { navigationItems } from '@/lib/navigation/constants';
import { cn } from '@/lib/utils';

type NavigationItemsProps = {
  variant: 'horizontal' | 'vertical';
  className?: string;
};

export function NavigationItems({ variant, className }: NavigationItemsProps) {
  const pathname = usePathname();

  if (variant === 'horizontal') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {navigationItems.map(item => (
          <Button key={item.title} variant="ghost" asChild>
            <Link href={item.url} className={navigationMenuTriggerStyle()}>
              <span className="text-base mr-2">{item.icon}</span>
              {item.title}
            </Link>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <SidebarMenu className={className}>
      {navigationItems.map(item => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={pathname === item.url}>
            <Link href={item.url}>
              <span className="text-base">{item.icon}</span>
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
