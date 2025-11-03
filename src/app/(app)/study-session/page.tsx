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
import { useSubjects, useStudySessions, useProgress } from '@/hooks/use-app-data';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Play, Pause, RefreshCw, SkipForward } from 'lucide-react';
import type { StudySession, Subject } from '@/lib/types';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTimer } from '@/hooks/use-timer';


export default function StudySessionPage() {
  const {
    sessionType,
    timeLeft,
    isActive,
    isTimerVisible,
    manualDuration,
    setManualDuration,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    endWorkSession,
    setIsTimerVisible,
  } = useTimer();

  const [subjects] = useSubjects();
  const [progress, setProgress] = useProgress();
  const [, addSession] = useStudySessions();
  const { toast } = useToast();

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');

  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [lastCompletedSession, setLastCompletedSession] = useState<{subjectId: string, topicId: string, subject: Subject} | null>(null);

  // When this page mounts, ensure the timer is not shown as a floating widget
  useEffect(() => {
    setIsTimerVisible(false);
  }, [setIsTimerVisible]);

  const getTimerDuration = useCallback(() => {
    switch (sessionType) {
      case 'work':
        return manualDuration * 60;
      case 'shortBreak':
        return 5 * 60; // Assuming settings are handled in hook
      case 'longBreak':
        return 15 * 60;
    }
  }, [sessionType, manualDuration]);

  const handleSessionEnd = useCallback(() => {
    if (sessionType === 'work' && isActive === false) { // Check isActive to ensure it just finished
        if (selectedSubject && selectedTopic) {
            const subject = subjects.find(s => s.id === selectedSubject);
            if (!subject) return;

            const newSession: Omit<StudySession, 'id'> = {
                date: Date.now(),
                subjectId: selectedSubject,
                topicId: selectedTopic,
                duration: manualDuration,
                sessionType: 'study',
                notes: sessionNotes,
                productive: true,
            };
            addSession(newSession);
            toast({ title: "Study session logged!", description: `${manualDuration} minutes of focused work.` });
            
            setLastCompletedSession({ subjectId: selectedSubject, topicId: selectedTopic, subject });
            setShowCompletionDialog(true);
            setSessionNotes('');
        } else {
            endWorkSession(false);
            toast({ title: "Time for a break!" });
        }
    }
  }, [sessionType, selectedSubject, selectedTopic, manualDuration, sessionNotes, addSession, toast, subjects, endWorkSession, isActive]);


  // When timer hits 0, handle the session end logic
  useEffect(() => {
    if (timeLeft === 0) {
      handleSessionEnd();
    }
  }, [timeLeft, handleSessionEnd]);


  const availableChapters = useMemo(() => {
    if (!selectedSubject) return [];
    const subject = subjects.find((s) => s.id === selectedSubject);
    return subject ? subject.chapters || [] : [];
  }, [selectedSubject, subjects]);

  const availableTopics = useMemo(() => {
    if (!selectedChapter) return [];
    const chapter = availableChapters.find((c) => c.id === selectedChapter);
    return chapter ? chapter.topics || [] : [];
  }, [selectedChapter, availableChapters]);

  const handleUpdateTopicStatus = (markAsComplete: boolean) => {
    if (markAsComplete && lastCompletedSession) {
        const { topicId } = lastCompletedSession;
        const currentProgress = progress[topicId] || { status: 'not-started', priority: 'medium', difficulty: null, completedDate: null, timeSpent: 0, notes: '', revisionDates: [] };
        const updatedProgress = { ...currentProgress, status: 'completed', completedDate: Date.now() };
        setProgress({ ...progress, [topicId]: updatedProgress });
        toast({ title: "Topic marked as completed!" });
    }
    setShowCompletionDialog(false);
    setLastCompletedSession(null);
    endWorkSession(markAsComplete);
    toast({ title: "Time for a break!" });
  }


  const toggleTimer = () => {
    if (isActive) {
      pauseTimer();
    } else {
      if (sessionType === 'work' && (!selectedSubject || !selectedTopic)) {
        toast({
          variant: 'destructive',
          title: 'Missing information',
          description: 'Please select a subject and topic before starting.',
        });
        return;
      }
      startTimer();
    }
  };
  
  const handleSkip = () => {
    // Manually trigger session end logic if skipping a work session
    if (sessionType === 'work') {
      handleSessionEnd();
    } else {
      // If skipping a break, just skip it.
      skipTimer();
    }
  }


  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const progressPercentage = (timeLeft / getTimerDuration()) * 100;
  
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
                strokeDashoffset={((100 - progressPercentage) / 100) * (2 * Math.PI * 42)}
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
               <div className="space-y-2">
                <Label htmlFor="manual-duration">Session Duration (minutes)</Label>
                <Input 
                    id="manual-duration"
                    type="number"
                    value={manualDuration}
                    onChange={(e) => {
                        const newDuration = parseInt(e.target.value, 10);
                        if (!isNaN(newDuration) && newDuration > 0) {
                            setManualDuration(newDuration);
                        }
                    }}
                    disabled={isActive}
                    min="1"
                />
               </div>
              <Select
                value={selectedSubject || ''}
                onValueChange={(val) => {
                  setSelectedSubject(val);
                  setSelectedChapter(null);
                  setSelectedTopic(null);
                }}
                disabled={isActive}
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
                value={selectedChapter || ''}
                onValueChange={(val) => {
                    setSelectedChapter(val);
                    setSelectedTopic(null);
                }}
                disabled={!selectedSubject || isActive}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a chapter" />
                </SelectTrigger>
                <SelectContent>
                  {availableChapters.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedTopic || ''}
                onValueChange={setSelectedTopic}
                disabled={!selectedChapter || isActive}
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
              <Textarea placeholder="Session notes (optional)..." value={sessionNotes} onChange={e => setSessionNotes(e.target.value)} disabled={isActive} />
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
          <Button variant="ghost" size="icon" onClick={handleSkip}>
            <SkipForward className="h-6 w-6" />
          </Button>
        </CardFooter>
      </Card>
      <AlertDialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Session Complete!</AlertDialogTitle>
                <AlertDialogDescription>
                    Great work! How did you feel about that topic?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => handleUpdateTopicStatus(false)}>Need more time to finish this</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleUpdateTopicStatus(true)}>Mark the topic as completed</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
