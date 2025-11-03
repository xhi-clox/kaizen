'use client';

import { useGoals, useSettings } from '@/hooks/use-app-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import Link from 'next/link';
import { Target } from 'lucide-react';

export function TodaysGoals() {
    const [goals] = useGoals();
    const [settings] = useSettings();

    const todayString = format(new Date(), 'yyyy-MM-dd');
    const todaysGoal = useMemo(() => {
        const goal = goals.daily.find(g => g.date === todayString);
        if (goal) return goal;
        return {
            date: todayString,
            studyHours: settings.dailyStudyHoursGoal,
            topicsToComplete: 2, // default
            completed: false,
            actualHours: 0,
            actualTopics: 0
        };
    }, [goals.daily, todayString, settings.dailyStudyHoursGoal]);

    const hoursProgress = todaysGoal.studyHours > 0 ? (todaysGoal.actualHours / todaysGoal.studyHours) * 100 : 100;
    const topicsProgress = todaysGoal.topicsToComplete > 0 ? (todaysGoal.actualTopics / todaysGoal.topicsToComplete) * 100 : 100;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Today&apos;s Goals</CardTitle>
                <CardDescription>Keep track of your targets for today.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {todaysGoal.studyHours === 0 && todaysGoal.topicsToComplete === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 text-center py-10 border-2 border-dashed rounded-lg">
                        <Target className="w-12 h-12 text-muted-foreground" />
                        <p className="text-muted-foreground">You haven&apos;t set any goals for today.</p>
                        <Button asChild>
                            <Link href="/goals">Set Daily Goals</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">Study Hours</span>
                                <span className="text-sm text-muted-foreground">{todaysGoal.actualHours.toFixed(1)} / {todaysGoal.studyHours}h</span>
                            </div>
                            <Progress value={hoursProgress} />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">Topics to Complete</span>
                                <span className="text-sm text-muted-foreground">{todaysGoal.actualTopics} / {todaysGoal.topicsToComplete}</span>
                            </div>
                            <Progress value={topicsProgress} />
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
