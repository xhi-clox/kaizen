'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getItem } from '@/lib/storage';
import type { UserProfile } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const userProfile = getItem<UserProfile | null>('hsc-profile', null);
    
    if (userProfile && userProfile.name) {
      router.replace('/dashboard');
    } else {
      router.replace('/welcome');
    }
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading Your Success Plan...</p>
      </div>
    </div>
  );
}
