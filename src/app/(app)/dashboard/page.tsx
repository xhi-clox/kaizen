'use client';

import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/use-app-data';
import { BookCopy, Timer } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Countdown } from '@/components/dashboard/countdown';
import { QuickStats } from '@/components/dashboard/quick-stats';
import { TodaysGoals } from '@/components/dashboard/todays-goals';
import { SubjectProgressList } from '@/components/dashboard/subject-progress-list';
import { RecentSessions } from '@/components/dashboard/recent-sessions';

export default function DashboardPage() {
  const [profile] = useProfile();
  const [quote, setQuote] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const motivationalQuotes = [
      "Success is the sum of small efforts repeated daily.",
      "The secret to getting ahead is getting started.",
      "You're preparing for your future!",
      "Believe you can and you're halfway there.",
    ];
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, []);


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {isClient && profile ? (
              <>Welcome back, <span className="hsc-gradient-text">{profile.name}!</span></>
            ) : (
              <>Welcome back!</>
            )}
          </h1>
          <p className="text-muted-foreground">{quote}</p>
        </div>
        <div className="flex items-center gap-2">
            <Button asChild>
                <Link href="/study-session"><Timer className="mr-2" />Start Study Session</Link>
            </Button>
            <Button variant="secondary" asChild>
                 <Link href="/subjects"><BookCopy className="mr-2" />Log Progress</Link>
            </Button>
        </div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <Countdown />
        <QuickStats />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <TodaysGoals />
        </div>
        <div className="lg:col-span-2">
          <RecentSessions />
        </div>
      </div>

      <div>
        <SubjectProgressList />
      </div>
    </div>
  );
}
