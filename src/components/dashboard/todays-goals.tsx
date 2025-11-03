'use client';

import { useGoals, useSettings, useStudySessions, useProgress } from '@/hooks/use-app-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useMemo } from 'react';
import { format, isSameDay } from 'date-fns';
import { Button } from '../ui/button';
import Link from 'next/link';
import { Target } from 'lucide-react';

export function TodaysGoals() {
    const [goals] = useGoals();
    const [settings] = useSettings();
    const [sessions] = useStudySessions();
    const [progress] = useProgress();

    const today = useMemo(() => new Date(), []);
    const todayString = useMemo(() => format(today, 'yyyy-MM-dd'), [today]);

    const { actualHours, actualTopics } = useMemo(() => {
        const todaySessions = sessions.filter(s => isSameDay(new Date(s.date), today));
        const hours = todaySessions.reduce((sum, s) => sum + s.duration, 0) / 60;
        
        const completedTopicIds = Object.entries(progress)
            .filter(([,p]) => p.status === 'completed' && p.completedDate && isSameDay(new Date(p.completedDate), today))
            .map(([topicId]) => topicId);
            
        return { actualHours: hours, actualTopics: completedTopicIds.length };
    }, [sessions, progress, today]);


    const todaysGoal = useMemo(() => {
        const goal = goals.daily.find(g => g.date === todayString);
        if (goal) {
            return { ...goal, actualHours, actualTopics };
        }
        
        // If no goal is set, create a default one from settings
        if (!settings) return {
             date: todayString, studyHours: 0, topicsToComplete: 0, completed: false, actualHours, actualTopics 
        };

        return {
            date: todayString,
            studyHours: settings.dailyStudyHoursGoal,
            topicsToComplete: 2, // default if not set
            completed: false,
            actualHours,
            actualTopics,
        };
    }, [goals.daily, todayString, settings, actualHours, actualTopics]);

    if (!todaysGoal) {
        return <Card><CardContent><p>Loading today&apos;s goals...</p></CardContent></Card>
    }

    const hoursProgress = todaysGoal.studyHours > 0 ? (todaysGoal.actualHours / todaysGoal.studyHours) * 100 : (todaysGoal.actualHours > 0 ? 100 : 0);
    const topicsProgress = todaysGoal.topicsToComplete > 0 ? (todaysGoal.actualTopics / todaysGoal.topicsToComplete) * 100 : (todaysGoal.actualTopics > 0 ? 100 : 0);

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
