'use client';

import { useSubjects } from '@/hooks/use-app-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useMemo } from 'react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { BookCopy, PlusCircle } from 'lucide-react';

export function SubjectProgressList() {
    const [subjects] = useSubjects();

    const subjectsWithProgress = useMemo(() => {
        if (!subjects) return [];
        return subjects.map(subject => {
            const totalTopics = subject.chapters.reduce((acc, chap) => acc + chap.topics.length, 0);
            const completedTopics = subject.chapters.reduce((acc, chap) => acc + chap.topics.filter(t => t.status === 'completed').length, 0);
            const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
            return { ...subject, progress, completedTopics, totalTopics };
        });
    }, [subjects]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Subject Progress</CardTitle>
                <CardDescription>An overview of your completion status for each subject.</CardDescription>
            </CardHeader>
            <CardContent>
                {subjectsWithProgress.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 text-center py-10 border-2 border-dashed rounded-lg">
                        <BookCopy className="w-12 h-12 text-muted-foreground" />
                        <p className="text-muted-foreground">You haven&apos;t added any subjects yet.</p>
                        <Button asChild>
                            <Link href="/subjects"><PlusCircle className="mr-2 h-4 w-4" /> Add Subject</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {subjectsWithProgress.map(subject => (
                            <div key={subject.id}>
                                <div className="flex justify-between items-center mb-1">
                                    <Link href={`/subjects#${subject.id}`} className="font-medium hover:underline" style={{color: subject.color}}>{subject.name}</Link>
                                    <span className="text-sm text-muted-foreground">{subject.progress}%</span>
                                </div>
                                <Progress value={subject.progress} indicatorColor={subject.color} />
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

declare module '@/components/ui/progress' {
    interface ProgressProps {
      indicatorColor?: string;
    }
}
