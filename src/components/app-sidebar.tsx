'use client';

import { usePathname } from 'next/navigation';
import {
  BookCopy,
  CalendarDays,
  LayoutDashboard,
  LineChart,
  Repeat,
  Settings,
  Target,
  Timer,
} from 'lucide-react';

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { AppLogo } from './app-logo';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/subjects', icon: BookCopy, label: 'Subjects' },
  { href: '/goals', icon: Target, label: 'Goals' },
  { href: '/study-session', icon: Timer, label: 'Study Session' },
  { href: '/routine', icon: CalendarDays, label: 'Routine' },
  { href: '/progress', icon: LineChart, label: 'Progress' },
  { href: '/revision', icon: Repeat, label: 'Revision' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="border-b border-sidebar-border">
        <AppLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={item.label}
              >
                <a href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
