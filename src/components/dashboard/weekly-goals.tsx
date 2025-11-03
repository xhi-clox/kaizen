
'use client';

import { useGoals, useSubjects } from '@/hooks/use-app-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo, useState } from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Button } from '../ui/button';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function WeeklyGoals() {
    const [goals] = useGoals();
    const [subjects] = useSubjects();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const today = useMemo(() => new Date(), []);
    const weekStart = useMemo(() => format(startOfWeek(today, { weekStartsOn: 6 }), 'yyyy-MM-dd'), [today]);
    const weekEnd = useMemo(() => format(endOfWeek(today, { weekStartsOn: 6 }), 'yyyy-MM-dd'), [today]);

    const currentWeeklyGoal = useMemo(() => {
        return goals.weekly.find(g => g.weekStart === weekStart);
    }, [goals.weekly, weekStart]);

    const shortenSubjectName = (name: string) => {
        if (name.includes('ICT')) return 'ICT';
        return name;
    }

    const targetsToShow = currentWeeklyGoal?.targets.slice(0, 3) || [];
    const allTargets = currentWeeklyGoal?.targets || [];

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>This Week's Goals</CardTitle>
                        <CardDescription>Your main targets for {format(new Date(weekStart), 'do MMM')} - {format(new Date(weekEnd), 'do MMM')}</CardDescription>
                    </div>
                    {allTargets.length > 3 && (
                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                            <DialogTrigger asChild>
                                <Button variant="link" size="sm" className="p-0 h-auto">View all</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>All Chapter Targets for the Week</DialogTitle>
                                </DialogHeader>
                                <ul className="space-y-3 py-4">
                                    {allTargets.map(t => {
                                        const subject = subjects.find(s => s.id === t.subjectId);
                                        if (!subject) return null;
                                        return (
                                            <li key={t.subjectId} className="flex justify-between items-center">
                                                <span style={{ color: subject.color }}>{shortenSubjectName(subject.name)}</span>
                                                <span className='font-semibold'>{t.chaptersToComplete} chapters</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {currentWeeklyGoal ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium mb-2 text-muted-foreground">Chapter Targets</h4>
                            <ul className="space-y-2">
                                {targetsToShow.length > 0 ? targetsToShow.map(t => {
                                    const subject = subjects.find(s => s.id === t.subjectId);
                                    if (!subject) return null;
                                    return (
                                        <li key={t.subjectId} className="flex justify-between items-center text-sm">
                                            <span style={{ color: subject.color }}>{shortenSubjectName(subject.name)}</span>
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
