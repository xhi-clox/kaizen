'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSettings, useSubjects, useStudySessions } from '@/hooks/use-app-data';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Play, Pause, RefreshCw, SkipForward } from 'lucide-react';
import type { StudySession, Topic } from '@/lib/types';
import { nanoid } from 'nanoid';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type SessionType = 'work' | 'shortBreak' | 'longBreak';

export default function StudySessionPage() {
  const [settings] = useSettings();
  const [subjects, setSubjects] = useSubjects();
  const [sessions, setSessions] = useStudySessions();
  const { toast } = useToast();

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');

  const [sessionCount, setSessionCount] = useState(0);
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [isActive, setIsActive] = useState(false);

  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [lastCompletedSession, setLastCompletedSession] = useState<{subjectId: string, topicId: string} | null>(null);


  const getTimerDuration = useCallback(() => {
    switch (sessionType) {
      case 'work':
        return settings.pomodoro.work * 60;
      case 'shortBreak':
        return settings.pomodoro.shortBreak * 60;
      case 'longBreak':
        return settings.pomodoro.longBreak * 60;
    }
  }, [settings, sessionType]);

  const [timeLeft, setTimeLeft] = useState(getTimerDuration());

  useEffect(() => {
    setTimeLeft(getTimerDuration());
  }, [settings, sessionType, getTimerDuration]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) { // only trigger when timer hits 0 and was active
        handleSessionEnd();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, timeLeft]);


  const availableTopics = useMemo(() => {
    if (!selectedSubject) return [];
    const subject = subjects.find((s) => s.id === selectedSubject);
    return subject ? subject.chapters.flatMap((c) => c.topics) : [];
  }, [selectedSubject, subjects]);


  const handleSessionEnd = useCallback(() => {
    setIsActive(false);
    
    if (sessionType === 'work') {
        if (selectedSubject && selectedTopic) {
            const newSession: StudySession = {
                id: nanoid(),
                date: Date.now(),
                subjectId: selectedSubject,
                topicId: selectedTopic,
                duration: settings.pomodoro.work,
                sessionType: 'study',
                notes: sessionNotes,
                productive: true,
            };
            setSessions(prev => [...prev, newSession]);
            toast({ title: "Study session logged!", description: `${settings.pomodoro.work} minutes of focused work.` });
            
            setLastCompletedSession({ subjectId: selectedSubject, topicId: selectedTopic });
            setShowCompletionDialog(true);
            setSessionNotes('');
        } else {
            // If no topic was selected, just move to break
            moveToNextSessionType();
        }
    } else {
        setSessionType('work');
        toast({ title: "Break's over! Time to focus.", variant: 'default' });
        setTimeLeft(getTimerDuration());
    }
  }, [sessionType, selectedSubject, selectedTopic, settings.pomodoro.work, sessionNotes, setSessions, toast, getTimerDuration]);

  const moveToNextSessionType = () => {
    const newSessionCount = sessionCount + 1;
    setSessionCount(newSessionCount);
    if (newSessionCount % 4 === 0) {
        setSessionType('longBreak');
        toast({ title: "Time for a long break!" });
    } else {
        setSessionType('shortBreak');
        toast({ title: "Time for a short break!" });
    }
    setTimeLeft(getTimerDuration());
  }

  const handleUpdateTopicStatus = (markAsComplete: boolean) => {
    if (markAsComplete && lastCompletedSession) {
      setSubjects(prevSubjects => 
        prevSubjects.map(s => 
          s.id === lastCompletedSession.subjectId 
            ? {
              ...s,
              chapters: s.chapters.map(c => ({
                ...c,
                topics: c.topics.map(t => 
                  t.id === lastCompletedSession.topicId 
                  ? { ...t, status: 'completed', completedDate: Date.now() } 
                  : t
                )
              }))
            }
            : s
        )
      );
      toast({ title: "Topic marked as completed!" });
    }
    setShowCompletionDialog(false);
    setLastCompletedSession(null);
    moveToNextSessionType();
  }


  const toggleTimer = () => {
    if (sessionType === 'work' && (!selectedSubject || !selectedTopic)) {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please select a subject and topic before starting.',
      });
      return;
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(getTimerDuration());
  };

  const skipToNext = () => {
    if(isActive) {
        handleSessionEnd();
    } else {
        if (sessionType === 'work') {
            moveToNextSessionType();
        } else {
            setSessionType('work');
            setTimeLeft(getTimerDuration());
        }
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const progress = (timeLeft / getTimerDuration()) * 100;
  
  if (subjects.length === 0) {
    return (
        <Card>
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                <h3 className="text-xl font-semibold mb-2">Set Up Subjects First</h3>
                <p className="text-muted-foreground mb-4">You need to add subjects and topics before you can start a study session.</p>
                <Button asChild><Link href="/subjects">Go to Subjects</Link></Button>
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="flex justify-center items-center h-full">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">
            {sessionType === 'work'
              ? 'Study Session'
              : sessionType === 'shortBreak'
              ? 'Short Break'
              : 'Long Break'}
          </CardTitle>
          <CardDescription>
            {sessionType === 'work'
              ? 'Focus on your selected topic.'
              : 'Time to relax and recharge!'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="relative h-56 w-56">
            <svg className="h-full w-full" viewBox="0 0 100 100">
              <circle
                className="stroke-current text-gray-200 dark:text-gray-700"
                strokeWidth="7"
                cx="50"
                cy="50"
                r="42"
                fill="transparent"
              />
              <circle
                className="stroke-current text-primary"
                strokeWidth="7"
                cx="50"
                cy="50"
                r="42"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 42}
                strokeDashoffset={((100 - progress) / 100) * (2 * Math.PI * 42)}
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dashoffset 0.3s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-bold">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {sessionType === 'work' && (
            <div className="w-full space-y-4">
              <Select
                value={selectedSubject || ''}
                onValueChange={(val) => {
                  setSelectedSubject(val);
                  setSelectedTopic(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedTopic || ''}
                onValueChange={setSelectedTopic}
                disabled={!selectedSubject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  {availableTopics.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea placeholder="Session notes (optional)..." value={sessionNotes} onChange={e => setSessionNotes(e.target.value)} />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button variant="ghost" size="icon" onClick={resetTimer}>
            <RefreshCw className="h-6 w-6" />
          </Button>
          <Button size="lg" className="w-32" onClick={toggleTimer}>
            {isActive ? (
              <Pause className="mr-2 h-5 w-5" />
            ) : (
              <Play className="mr-2 h-5 w-5" />
            )}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button variant="ghost" size="icon" onClick={skipToNext}>
            <SkipForward className="h-6 w-6" />
          </Button>
        </CardFooter>
      </Card>
      <AlertDialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Session Complete!</AlertDialogTitle>
                <AlertDialogDescription>
                    Great work! Do you want to mark this topic as completed?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => handleUpdateTopicStatus(false)}>Not yet</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleUpdateTopicStatus(true)}>Yes, mark as complete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
