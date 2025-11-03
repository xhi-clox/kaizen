'use client';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ThemeToggle } from './theme-toggle';
import { useProfile } from '@/hooks/use-app-data';
import { useEffect, useState } from 'react';
import { useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

const getPageTitle = (pathname: string) => {
    if (pathname.startsWith('/dashboard')) return 'Dashboard';
    if (pathname.startsWith('/subjects')) return 'Subjects & Syllabus';
    if (pathname.startsWith('/goals')) return 'Goals';
    if (pathname.startsWith('/study-session')) return 'Study Session';
    if (pathname.startsWith('/routine')) return 'Routine Planner';
    if (pathname.startsWith('/progress')) return 'Progress & Analytics';
    if (pathname.startsWith('/revision')) return 'Revision System';
    if (pathname.startsWith('/settings')) return 'Settings';
    return 'Kaizen 改善';
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { logOut } = useAuth();
  const { toast } = useToast();
  const [profile] = useProfile();
  const pageTitle = getPageTitle(pathname);
  const [initials, setInitials] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const getInitials = (name: string) => {
      if (!name) return '';
      const names = name.split(' ');
      if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    };
    if (profile) {
        setInitials(getInitials(profile.name));
    }
  }, [profile]);

  const handleLogout = async () => {
    try {
      await logOut();
      router.push('/login');
      toast({ title: 'Logged out successfully.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Logout failed.' });
    }
  }


  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-lg font-semibold md:text-xl">{pageTitle}</h1>
        </div>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src="https://picsum.photos/seed/hsc-user/100/100" alt={profile?.name} data-ai-hint="person portrait" />
                <AvatarFallback>{isClient ? initials : ''}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{profile?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  HSC Candidate
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
