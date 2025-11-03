
'use client';

import { useRoutine, useSubjects } from '@/hooks/use-app-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, Book } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

export function TodaysRoutine() {
    const [routine] = useRoutine();
    const [subjects] = useSubjects();

    const today = useMemo(() => new Date(), []);
    const todayDayName = useMemo(() => format(today, 'eeee').toLowerCase() as any, [today]);

    const todaysSchedule = useMemo(() => {
        return routine.weekSchedule.find(d => d.day === todayDayName);
    }, [routine.weekSchedule, todayDayName]);

    const getSubject = (subjectId: string) => {
        if (['break', 'prayer', 'other'].includes(subjectId)) {
            return { name: subjectId.charAt(0).toUpperCase() + subjectId.slice(1), color: '#888' };
        }
        return subjects.find(s => s.id === subjectId);
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Today&apos;s Routine ({format(today, 'eeee, do MMMM')})</CardTitle>
                <CardDescription>Your scheduled plan for today.</CardDescription>
            </CardHeader>
            <CardContent>
                {!todaysSchedule || todaysSchedule.slots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 text-center py-10 border-2 border-dashed rounded-lg">
                        <Calendar className="w-12 h-12 text-muted-foreground" />
                        <p className="text-muted-foreground">You have no routine scheduled for today.</p>
                        <Button asChild>
                            <Link href="/routine">Plan Your Week</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {todaysSchedule.slots.map(slot => {
                            const subject = getSubject(slot.subjectId);
                            return (
                                <div key={slot.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-3 rounded-lg border" style={{ borderLeft: `4px solid ${subject?.color || '#ccc'}`}}>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground w-full sm:w-28">
                                        <Clock className="h-4 w-4" />
                                        <span>{slot.startTime} - {slot.endTime}</span>
                                    </div>
                                    <div className="flex-1 flex items-center gap-3">
                                        <div className="font-semibold">{subject?.name || 'Unnamed Activity'}</div>
                                        <div className="capitalize text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{slot.activity}</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
