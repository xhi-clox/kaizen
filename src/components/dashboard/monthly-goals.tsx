
'use client';

import { useGoals, useSubjects, useProgress } from '@/hooks/use-app-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';
import { format, startOfMonth } from 'date-fns';
import { Button } from '../ui/button';
import Link from 'next/link';
import { Target } from 'lucide-react';
import { Progress } from '../ui/progress';

export function MonthlyGoals() {
    const [goals] = useGoals();
    const [subjects] = useSubjects();
    const [progress] = useProgress();

    const today = useMemo(() => new Date(), []);
    const monthStart = useMemo(() => format(startOfMonth(today), 'yyyy-MM'), [today]);

    const currentMonthlyGoal = useMemo(() => {
        return goals.monthly.find(g => g.month === monthStart);
    }, [goals.monthly, monthStart]);

    const subjectProgressData = useMemo(() => {
        if (!subjects) return {};
        const data: { [key: string]: number } = {};
        subjects.forEach(subject => {
            const allTopics = (subject.chapters || []).flatMap(c => c.topics);
            if (allTopics.length === 0) {
                data[subject.id] = 0;
                return;
            }
            const completed = allTopics.filter(t => progress[t.id]?.status === 'completed').length;
            data[subject.id] = (completed / allTopics.length) * 100;
        });
        return data;
    }, [subjects, progress]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>This Month's Milestones ({format(today, 'MMMM yyyy')})</CardTitle>
                <CardDescription>Your high-level completion targets for the month.</CardDescription>
            </CardHeader>
            <CardContent>
                {currentMonthlyGoal ? (
                    <div className="space-y-4">
                        {currentMonthlyGoal.milestones.map(m => {
                            const subject = subjects.find(s => s.id === m.subjectId);
                            if (!subject) return null;
                            const currentProgress = subjectProgressData[m.subjectId] || 0;
                            return (
                                <div key={m.subjectId}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-medium text-sm" style={{ color: subject.color }}>{subject.name}</span>
                                        <span className="text-sm text-muted-foreground">{currentProgress.toFixed(0)}% / {m.targetCompletion}%</span>
                                    </div>
                                    <Progress value={currentProgress} indicatorColor={subject.color} />
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-4 text-center py-10 border-2 border-dashed rounded-lg">
                        <Target className="w-12 h-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No milestones set for this month.</p>
                        <Button asChild>
                            <Link href="/goals">Set Monthly Goals</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
