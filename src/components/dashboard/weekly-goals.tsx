
'use client';

import { useGoals, useSubjects } from '@/hooks/use-app-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Button } from '../ui/button';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

export function WeeklyGoals() {
    const [goals] = useGoals();
    const [subjects] = useSubjects();

    const today = useMemo(() => new Date(), []);
    const weekStart = useMemo(() => format(startOfWeek(today, { weekStartsOn: 6 }), 'yyyy-MM-dd'), [today]);
    const weekEnd = useMemo(() => format(endOfWeek(today, { weekStartsOn: 6 }), 'yyyy-MM-dd'), [today]);

    const currentWeeklyGoal = useMemo(() => {
        return goals.weekly.find(g => g.weekStart === weekStart);
    }, [goals.weekly, weekStart]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>This Week's Goals</CardTitle>
                <CardDescription>Your main targets for {format(new Date(weekStart), 'do MMM')} - {format(new Date(weekEnd), 'do MMM')}</CardDescription>
            </CardHeader>
            <CardContent>
                {currentWeeklyGoal ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium mb-2 text-muted-foreground">Chapter Targets</h4>
                            <ul className="space-y-2">
                                {currentWeeklyGoal.targets.length > 0 ? currentWeeklyGoal.targets.map(t => {
                                    const subject = subjects.find(s => s.id === t.subjectId);
                                    if (!subject) return null;
                                    return (
                                        <li key={t.subjectId} className="flex justify-between items-center text-sm">
                                            <span style={{ color: subject.color }}>{subject.name}</span>
                                            <span className='font-semibold'>{t.chaptersToComplete} chapters</span>
                                        </li>
                                    );
                                }) : <p className="text-sm text-muted-foreground">No chapter targets set.</p>}
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium text-muted-foreground">Revision</h4>
                                <p className="text-lg font-bold">{currentWeeklyGoal.revisionHours} hours</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-muted-foreground">Mock Tests</h4>
                                <p className="text-lg font-bold">{currentWeeklyGoal.mockTests} tests</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-4 text-center py-10 border-2 border-dashed rounded-lg">
                        <Calendar className="w-12 h-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No goals set for this week.</p>
                        <Button asChild>
                            <Link href="/goals">Set Weekly Goals</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
