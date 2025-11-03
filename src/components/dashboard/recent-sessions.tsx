
'use client';

import { useStudySessions, useSubjects } from '@/hooks/use-app-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { timeAgo } from '@/lib/utils';
import { useMemo } from 'react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Timer } from 'lucide-react';

export function RecentSessions() {
    const [sessions] = useStudySessions();
    const [subjects] = useSubjects();

    const recentSessions = useMemo(() => {
        if (!sessions || !subjects) return [];
        return sessions
            .sort((a, b) => b.date - a.date)
            .slice(0, 10)
            .map(session => {
                const subject = subjects.find(s => s.id === session.subjectId);
                const topic = subject?.chapters.flatMap(c => c.topics).find(t => t.id === session.topicId);
                return { ...session, subjectName: subject?.name, topicName: topic?.name, subjectColor: subject?.color };
            });
    }, [sessions, subjects]);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Recent Study Sessions</CardTitle>
                <CardDescription>A log of your latest study activities.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <ScrollArea className="h-full">
                    {recentSessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                            <p className="text-muted-foreground">No study sessions logged yet.</p>
                            <Button variant="link" asChild className="mt-2">
                                <Link href="/study-session"><Timer className="mr-2 h-4 w-4" />Start a session</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentSessions.map(session => (
                                <div key={session.id} className="flex items-center">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm leading-tight">{session.topicName || 'Unknown Topic'}</p>
                                        <p className="text-xs" style={{ color: session.subjectColor }}>{session.subjectName || 'Unknown Subject'}</p>
                                        <p className="text-xs text-muted-foreground">{session.duration} mins &middot; {timeAgo(new Date(session.date))}</p>
                                    </div>
                                    <div className={`capitalize text-xs font-semibold px-2 py-1 rounded-full ${
                                        session.sessionType === 'study' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                                        session.sessionType === 'revision' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'}`}>
                                        {session.sessionType}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
