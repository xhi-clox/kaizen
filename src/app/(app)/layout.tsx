import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Header } from '@/components/header';
import { redirect } from 'next/navigation';
import { getItem } from '@/lib/storage';
import { UserProfile } from '@/lib/types';


export default function AppLayout({ children }: { children: ReactNode }) {
  const profile = getItem<UserProfile | null>('hsc-profile', null);
  if (!profile || !profile.name) {
    redirect('/welcome');
  }
  
  return (
    <SidebarProvider>
        <div className="min-h-screen w-full bg-background">
            <Sidebar>
                <AppSidebar />
            </Sidebar>
            <SidebarInset>
                <div className="flex h-full flex-col">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                        {children}
                    </main>
                </div>
            </SidebarInset>
        </div>
    </SidebarProvider>
  );
}
