'use client';

import { useSubjects, useSettings, useStudySessions } from '@/hooks/use-app-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Repeat, ArrowRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { RevisionTopic } from '@/ai/flows/personalized-revision-plan';
import { generateRevisionPlan } from '@/ai/flows/personalized-revision-plan';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function RevisionPage() {
  const [subjects] = useSubjects();
  const [settings] = useSettings();
  const [sessions] = useStudySessions();
  const { toast } = useToast();

  const [revisionQueue, setRevisionQueue] = useState<RevisionTopic[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const allTopics = useMemo(() => {
    if (!subjects || !sessions) return [];
    return subjects.flatMap(subject => 
        subject.chapters.flatMap(chapter => 
            chapter.topics.map(topic => {
                const lastSession = sessions
                    .filter(s => s.topicId === topic.id && s.sessionType === 'revision')
                    .sort((a,b) => b.date - a.date)[0];
                
                return {
                    topicId: topic.id,
                    topicName: topic.name,
                    subjectId: subject.id,
                    subjectName: subject.name,
                    difficulty: topic.difficulty,
                    status: topic.status,
                    lastRevisedDate: lastSession ? new Date(lastSession.date).toISOString() : null,
                    timesRevised: sessions.filter(s => s.topicId === topic.id && s.sessionType === 'revision').length,
                    priority: topic.priority,
                } as RevisionTopic
            })
        )
    );
  }, [subjects, sessions]);

  const handleGenerateQueue = async () => {
    setIsGenerating(true);
    try {
        const input = {
            topics: allTopics,
            spacedRepetitionIntervals: { easy: 7, medium: 4, hard: 2 }, // Example intervals
            currentDate: new Date().toISOString(),
        };

        const result = await generateRevisionPlan(input);
        setRevisionQueue(result.revisionQueue);

        toast({
            title: "Revision Queue Generated!",
            description: "Your personalized revision queue is ready.",
        });
    } catch (error) {
        console.error("Error generating revision queue:", error);
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "Could not generate the revision queue.",
        });
    } finally {
        setIsGenerating(false);
    }
  }


  return (
    <div className="space-y-6">
       <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Revision System</h1>
          <p className="text-muted-foreground">AI-powered spaced repetition to master your topics.</p>
        </div>
        <Button onClick={handleGenerateQueue} disabled={isGenerating || allTopics.length === 0}>
          <BrainCircuit className="mr-2 h-4 w-4" />
          {isGenerating ? 'Generating...' : 'Generate Revision Queue'}
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Your Revision Queue</CardTitle>
            <CardDescription>Topics prioritized by the AI for you to revise today.</CardDescription>
        </CardHeader>
        <CardContent>
            {revisionQueue.length === 0 ? (
                <div className="text-center py-10">
                    <Repeat className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Queue is empty</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {allTopics.length === 0 
                            ? "Add some subjects and topics to get started." 
                            : "Click 'Generate Revision Queue' to get a personalized list of topics to revise."}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {revisionQueue.map(topic => {
                        const subject = subjects.find(s => s.id === topic.subjectId);
                        return (
                            <div key={topic.topicId} className="flex items-center justify-between p-4 rounded-lg border">
                                <div>
                                    <p className="font-semibold">{topic.topicName}</p>
                                    <p className="text-sm" style={{color: subject?.color}}>{subject?.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Last revised: {topic.lastRevisedDate ? new Date(topic.lastRevisedDate).toLocaleDateString() : 'Never'} &middot; 
                                        Difficulty: {topic.difficulty || 'N/A'}
                                    </p>
                                </div>
                                <Button asChild size="sm">
                                    <Link href={`/study-session?subject=${topic.subjectId}&topic=${topic.topicId}`}>
                                        Start Revising <ArrowRight className="ml-2 h-4 w-4"/>
                                    </Link>
                                </Button>
                            </div>
                        )
                    })}
                </div>
            )}
        </CardContent>
      </Card>

    </div>
  );
}
