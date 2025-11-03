'use client';

import { useState, useEffect } from 'react';
import { differenceInSeconds } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useProfile } from '@/hooks/use-app-data';
import { Button } from '../ui/button';
import { Edit } from 'lucide-react';
import Link from 'next/link';

export function Countdown() {
  const [profile] = useProfile();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!profile.examDate) return;

    const calculateTimeLeft = () => {
      const examDate = new Date(profile.examDate);
      const now = new Date();
      const totalSeconds = differenceInSeconds(examDate, now);

      if (totalSeconds <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [profile.examDate]);

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>Countdown to HSC Exam</CardTitle>
                <CardDescription>Time is ticking. Make every second count!</CardDescription>
            </div>
            <Button variant="ghost" size="icon" asChild>
                <Link href="/settings">
                    <Edit className="h-4 w-4" />
                </Link>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-3xl font-bold text-primary">{String(timeLeft.days).padStart(2, '0')}</p>
            <p className="text-xs text-muted-foreground">Days</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">{String(timeLeft.hours).padStart(2, '0')}</p>
            <p className="text-xs text-muted-foreground">Hours</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">{String(timeLeft.minutes).padStart(2, '0')}</p>
            <p className="text-xs text-muted-foreground">Minutes</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">{String(timeLeft.seconds).padStart(2, '0')}</p>
            <p className="text-xs text-muted-foreground">Seconds</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
