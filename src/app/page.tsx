'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppData } from '@/hooks/use-app-data';
import { Loader2 } from 'lucide-react';
import type { UserProfile } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const { profile, setupQuickStart } = useAppData();

  useEffect(() => {
    // If no profile exists, set up a default one and then navigate.
    if (!profile.name) {
      setupQuickStart('HSC Candidate');
    }
    router.replace('/dashboard');
  }, [router, profile.name, setupQuickStart]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading Your Success Plan...</p>
      </div>
    </div>
  );
}
