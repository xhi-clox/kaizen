
'use client';

import { useSubjects, useStudySessions, useGoals, useProgress } from '@/hooks/use-app-data';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, CheckCircle, Flame } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { startOfWeek, isSameDay } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const StatCard = ({ icon, label, value, colorClass }: { icon: React.ReactNode, label: string, value: string, colorClass: string }) => (
    <Card className="flex-1">
        <CardContent className="flex items-center gap-4 p-4">
            <div className={`rounded-full p-3 ${colorClass}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
            </div>
        </CardContent>
    </Card>
)

export function QuickStats() {
    const [subjects,, loadingSubjects] = useSubjects();
    const [progress,, loadingProgress] = useProgress();
    const [sessions] = useStudySessions();
    const [goals] = useGoals();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const allTopics = useMemo(() => {
        return subjects.flatMap(s => s.chapters.flatMap(c => c.topics));
    }, [subjects]);

    const overallCompletion = useMemo(() => {
        if (allTopics.length === 0) return 0;
        const completedTopics = allTopics.filter(t => progress[t.id]?.status === 'completed').length;
        return Math.round((completedTopics / allTopics.length) * 100);
    }, [allTopics, progress]);

    const weeklyStudyHours = useMemo(() => {
        if (!isClient || !sessions) return '0.0';
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 6 }); // Saturday
        const weekSessions = sessions.filter(s => new Date(s.date) >= weekStart);
        const totalMinutes = weekSessions.reduce((acc, s) => acc + s.duration, 0);
        return (totalMinutes / 60).toFixed(1);
    }, [sessions, isClient]);
    
    const studyStreak = useMemo(() => {
        if (!goals?.daily.length) return 0;
        let streak = 0;
        let currentDate = new Date();
        const sortedGoals = [...goals.daily].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        for (const goal of sortedGoals) {
            if (goal.completed && isSameDay(new Date(goal.date), currentDate)) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else if (new Date(goal.date) < currentDate) {
                break;
            }
        }
        return streak;
    }, [goals?.daily]);

    if (loadingSubjects || loadingProgress) {
        return <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
            {[1,2,3].map(i => <Card key={i} className="h-24"><CardContent className="p-4"><Skeleton className="h-full w-full"/></CardContent></Card>)}
        </div>
    }

    return (
        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
            <StatCard icon={<CheckCircle className="text-green-500" />} label="Overall Completion" value={`${overallCompletion}%`} colorClass="bg-green-100 dark:bg-green-900" />
            <StatCard icon={<Flame className="text-orange-500" />} label="Study Streak" value={`${studyStreak} Days`} colorClass="bg-orange-100 dark:bg-orange-900" />
            <StatCard icon={<BarChart className="text-blue-500" />} label="This Week's Hours" value={`${weeklyStudyHours}h`} colorClass="bg-blue-100 dark:bg-blue-900" />
        </div>
    );
}
