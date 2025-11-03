'use client';

import { useStudySessions, useSubjects } from '@/hooks/use-app-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { timeAgo } from '@/lib/utils';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Timer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

function SessionItem({ session }: { session: any }) {
    return (
        <div className="flex items-center">
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
    );
}


export function RecentSessions() {
    const [sessions] = useStudySessions();
    const [subjects] = useSubjects();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const allSessions = useMemo(() => {
        if (!sessions || !subjects) return [];
        return sessions
            .sort((a, b) => b.date - a.date)
            .map(session => {
                const subject = subjects.find(s => s.id === session.subjectId);
                const topic = subject?.chapters.flatMap(c => c.topics).find(t => t.id === session.topicId);
                return { ...session, subjectName: subject?.name, topicName: topic?.name, subjectColor: subject?.color };
            });
    }, [sessions, subjects]);

    const sessionsToShow = allSessions.slice(0, 5);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                 <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Recent Study Sessions</CardTitle>
                        <CardDescription>A log of your latest study activities.</CardDescription>
                    </div>
                    {allSessions.length > sessionsToShow.length && (
                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                            <DialogTrigger asChild>
                                <Button variant="link" size="sm" className="p-0 h-auto">View all</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>All Recent Study Sessions</DialogTitle>
                                </DialogHeader>
                                <ScrollArea className="h-96">
                                    <div className="space-y-4 pr-4">
                                        {allSessions.map(session => (
                                            <SessionItem key={session.id} session={session} />
                                        ))}
                                    </div>
                                </ScrollArea>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
                {sessionsToShow.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4 m-auto">
                        <p className="text-muted-foreground">No study sessions logged yet.</p>
                        <Button variant="link" asChild className="mt-2">
                            <Link href="/study-session"><Timer className="mr-2 h-4 w-4" />Start a session</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sessionsToShow.map(session => (
                           <SessionItem key={session.id} session={session} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
