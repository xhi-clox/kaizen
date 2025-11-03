
'use client';

import { useGoals, useProfile, useSubjects, useStudySessions, useProgress } from '@/hooks/use-app-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Edit, Flag, Target, Trash2, PlusCircle, CheckCircle, Calendar, Repeat } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState, useEffect, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import type { DailyGoal } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

// Schemas
const examGoalSchema = z.object({
  targetGPA: z.coerce.number().min(1).max(5),
  examDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
  subjectTargets: z.array(
    z.object({
      subjectId: z.string(),
      targetMarks: z.coerce.number().min(0).max(100),
    })
  ),
});

const dailyGoalSchema = z.object({
    date: z.string(),
    studyHours: z.coerce.number().min(0),
    topicsToComplete: z.coerce.number().min(0),
    completed: z.boolean().default(false),
});

const weeklyGoalSchema = z.object({
    weekStart: z.string(),
    targets: z.array(z.object({
        subjectId: z.string(),
        chaptersToComplete: z.coerce.number().min(0)
    })),
    revisionHours: z.coerce.number().min(0),
    mockTests: z.coerce.number().min(0)
});

const monthlyGoalSchema = z.object({
    month: z.string(),
    milestones: z.array(z.object({
        subjectId: z.string(),
        targetCompletion: z.coerce.number().min(0).max(100),
    })),
});


// Components
function ExamGoals() {
  const [profile, setProfile] = useProfile();
  const [goals, setGoals] = useGoals();
  const [subjects] = useSubjects();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof examGoalSchema>>({
    resolver: zodResolver(examGoalSchema),
  });

  useEffect(() => {
    if (goals && subjects.length > 0) {
      const defaultValues = {
        targetGPA: goals.exam?.targetGPA || profile.targetGPA,
        examDate: goals.exam?.examDate || profile.examDate,
        subjectTargets: subjects.map(s => {
          const existing = goals.exam?.subjectTargets?.find(t => t.subjectId === s.id);
          return existing || { subjectId: s.id, targetMarks: 80 };
        }),
      }
      form.reset(defaultValues);
    }
  }, [goals, subjects, profile, form]);

  const { fields } = useFieldArray({
    control: form.control,
    name: 'subjectTargets',
  });

  const onSubmit = (data: z.infer<typeof examGoalSchema>) => {
    setGoals({ ...goals, exam: data });
    setProfile(p => ({ ...p, examDate: data.examDate, targetGPA: data.targetGPA }));
    setOpen(false);
  };
  
  if (!goals?.exam) return <p>Loading exam goals...</p>

  const gpaProgress = ((goals.exam.targetGPA || 0) / 5) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2"><Flag /> Exam Goals</CardTitle>
            <CardDescription>Your ultimate targets for the HSC exam.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" /> Edit Goals</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Exam Goals</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <ScrollArea className="max-h-[70vh] p-1">
                    <div className="space-y-4 pr-4">
                      <FormField control={form.control} name="examDate" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exam Date</FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="targetGPA" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target GPA</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <div>
                        <h4 className="text-sm font-medium mb-2">Subject Mark Targets</h4>
                        <div className="space-y-2">
                          {fields.map((field, index) => {
                            const subject = subjects.find(s => s.id === field.subjectId);
                            if (!subject) return null;
                            return (
                              <div key={field.id} className="flex items-center gap-2">
                                <Label className="flex-1" style={{ color: subject.color }}>{subject.name}</Label>
                                <FormField control={form.control} name={`subjectTargets.${index}.targetMarks`} render={({ field }) => (
                                  <FormItem>
                                    <FormControl><Input type="number" className="w-24 h-8" {...field} /></FormControl>
                                  </FormItem>
                                )} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                  <Button type="submit">Save Changes</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="font-medium">Target GPA</span>
            <span className="text-muted-foreground">
              {goals.exam.targetGPA?.toFixed(2)} / 5.00
            </span>
          </div>
          <Progress value={gpaProgress} />
        </div>
        <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Subject Targets</h4>
            {goals.exam.subjectTargets?.map(target => {
                const subject = subjects.find(s => s.id === target.subjectId);
                if (!subject) return null;
                const progress = (target.targetMarks / 100) * 100;
                return (
                    <div key={target.subjectId}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-sm" style={{color: subject.color}}>{subject.name}</span>
                            <span className="text-sm text-muted-foreground">{target.targetMarks} / 100</span>
                        </div>
                        <Progress value={progress} indicatorColor={subject.color} />
                    </div>
                )
            })}
        </div>
      </CardContent>
    </Card>
  );
}

function DailyGoals() {
  const [goals, setGoals] = useGoals();
  const [sessions] = useStudySessions();
  const [progress] = useProgress();

  const [open, setOpen] = useState(false);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  
  const { actualHours, actualTopics } = useMemo(() => {
    const todaySessions = sessions.filter(s => isSameDay(new Date(s.date), today));
    const hours = todaySessions.reduce((sum, s) => sum + s.duration, 0) / 60;
    
    const completedTopicIds = Object.entries(progress)
        .filter(([,p]) => p.status === 'completed' && p.completedDate && isSameDay(new Date(p.completedDate), today))
        .map(([topicId]) => topicId);
        
    return { actualHours: hours, actualTopics: completedTopicIds.length };
  }, [sessions, progress, today]);

  const todaysGoal = useMemo(() => {
      const goal = goals.daily.find(g => g.date === todayStr);
      if (goal) {
          return {...goal, actualHours, actualTopics};
      }
      return {
          date: todayStr,
          studyHours: 6,
          topicsToComplete: 3,
          completed: false,
          actualHours,
          actualTopics
      }
  }, [goals.daily, todayStr, actualHours, actualTopics]);

  const form = useForm<z.infer<typeof dailyGoalSchema>>({
    resolver: zodResolver(dailyGoalSchema),
    defaultValues: {
        date: todaysGoal.date,
        studyHours: todaysGoal.studyHours,
        topicsToComplete: todaysGoal.topicsToComplete,
        completed: todaysGoal.completed
    },
  });
  
  useEffect(() => {
    form.reset({
        date: todaysGoal.date,
        studyHours: todaysGoal.studyHours,
        topicsToComplete: todaysGoal.topicsToComplete,
        completed: todaysGoal.completed
    });
  }, [todaysGoal, form]);

  const onSubmit = (data: z.infer<typeof dailyGoalSchema>) => {
    const updatedDailyGoals = goals.daily.filter(g => g.date !== data.date);
    // When saving, don't include actuals
    const { actualHours, actualTopics, ...goalToSave} = todaysGoal;
    setGoals({ ...goals, daily: [...updatedDailyGoals, { ...goalToSave, ...data }] });
    setOpen(false);
  };
  
  const toggleGoalCompletion = (goal: DailyGoal) => {
    const updatedGoal = { ...goal, completed: !goal.completed };
    const updatedDailyGoals = goals.daily.map(g => g.date === goal.date ? updatedGoal : g);
    setGoals({ ...goals, daily: updatedDailyGoals });
  };
  
  const hoursProgress = todaysGoal.studyHours > 0 ? (todaysGoal.actualHours / todaysGoal.studyHours) * 100 : 0;
  const topicsProgress = todaysGoal.topicsToComplete > 0 ? (todaysGoal.actualTopics / todaysGoal.topicsToComplete) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>Today&apos;s Goals ({format(today, 'do MMMM')})</CardTitle>
                <CardDescription>Your daily targets to stay on track.</CardDescription>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Edit Today&apos;s Goal</DialogTitle></DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="studyHours" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Study Hours</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="topicsToComplete" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Topics to Complete</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <Button type="submit">Save Goal</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {todaysGoal ? (
            <>
                <div className="flex items-center space-x-2">
                    <Checkbox id="daily-completed" checked={todaysGoal.completed} onCheckedChange={() => toggleGoalCompletion(todaysGoal)} />
                    <label htmlFor="daily-completed" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Mark day as completed
                    </label>
                </div>
                <div>
                    <div className="flex justify-between mb-1"><span className="font-medium">Study Hours</span><span>{todaysGoal.actualHours.toFixed(1)} / {todaysGoal.studyHours}h</span></div>
                    <Progress value={hoursProgress} />
                </div>
                 <div>
                    <div className="flex justify-between mb-1"><span className="font-medium">Topics Completed</span><span>{todaysGoal.actualTopics} / {todaysGoal.topicsToComplete}</span></div>
                    <Progress value={topicsProgress} />
                </div>
            </>
        ) : (
            <div className="text-center py-8">
                <p className="text-muted-foreground">No goal set for today.</p>
            </div>
        )}
      </CardContent>
    </Card>
  )
}

function WeeklyGoals() {
  const [goals, setGoals] = useGoals();
  const [subjects] = useSubjects();
  const [open, setOpen] = useState(false);
  
  const today = new Date();
  const weekStart = format(startOfWeek(today, { weekStartsOn: 6 }), 'yyyy-MM-dd'); // Saturday
  const weekEnd = format(endOfWeek(today, { weekStartsOn: 6 }), 'yyyy-MM-dd');

  const currentWeeklyGoal = useMemo(() => {
    return goals.weekly.find(g => g.weekStart === weekStart);
  }, [goals.weekly, weekStart]);


  const form = useForm<z.infer<typeof weeklyGoalSchema>>({
    resolver: zodResolver(weeklyGoalSchema),
  });

  useEffect(() => {
    const defaultValues = {
        weekStart: weekStart,
        targets: subjects.map(s => {
            const existing = currentWeeklyGoal?.targets.find(t => t.subjectId === s.id);
            return existing || { subjectId: s.id, chaptersToComplete: 1 };
        }),
        revisionHours: currentWeeklyGoal?.revisionHours || 5,
        mockTests: currentWeeklyGoal?.mockTests || 1
    };
    form.reset(defaultValues);
  }, [currentWeeklyGoal, subjects, weekStart, form]);

  const { fields } = useFieldArray({
    control: form.control,
    name: 'targets',
  });

  const onSubmit = (data: z.infer<typeof weeklyGoalSchema>) => {
    const updatedWeeklyGoals = goals.weekly.filter(g => g.weekStart !== data.weekStart);
    setGoals({ ...goals, weekly: [...updatedWeeklyGoals, data] });
    setOpen(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>This Week&apos;s Goals</CardTitle>
                <CardDescription>{format(new Date(weekStart), 'do MMM')} - {format(new Date(weekEnd), 'do MMM')}</CardDescription>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Edit Weekly Goal</DialogTitle></DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <ScrollArea className="max-h-[70vh] p-1">
                        <div className="space-y-4 pr-4">
                            <div>
                                <h4 className="text-sm font-medium mb-2">Chapters to Complete</h4>
                                <div className="space-y-2">
                                {fields.map((field, index) => {
                                    const subject = subjects.find(s => s.id === field.subjectId);
                                    if (!subject) return null;
                                    return (
                                    <div key={field.id} className="flex items-center gap-2">
                                        <Label className="flex-1" style={{ color: subject.color }}>{subject.name}</Label>
                                        <FormField control={form.control} name={`targets.${index}.chaptersToComplete`} render={({ field }) => (
                                        <FormItem><FormControl><Input type="number" className="w-20 h-8" {...field} /></FormControl></FormItem>
                                        )} />
                                    </div>
                                    );
                                })}
                                </div>
                            </div>
                            <FormField control={form.control} name="revisionHours" render={({ field }) => (
                                <FormItem><FormLabel>Revision Hours</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name="mockTests" render={({ field }) => (
                                <FormItem><FormLabel>Mock Tests</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                            )} />
                        </div>
                    </ScrollArea>
                  <Button type="submit">Save Goal</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentWeeklyGoal ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h4 className="font-medium mb-2">Chapter Targets</h4>
                    <ul className="space-y-2">
                        {currentWeeklyGoal.targets.map(t => {
                            const subject = subjects.find(s => s.id === t.subjectId);
                            if (!subject) return null;
                            return <li key={t.subjectId} className="flex justify-between text-sm">
                                <span style={{ color: subject.color }}>{subject.name}</span>
                                <span>{t.chaptersToComplete} chapters</span>
                            </li>
                        })}
                    </ul>
                </div>
                <div className="space-y-4">
                     <div><h4 className="font-medium">Revision</h4><p className="text-muted-foreground">{currentWeeklyGoal.revisionHours} hours</p></div>
                     <div><h4 className="font-medium">Mock Tests</h4><p className="text-muted-foreground">{currentWeeklyGoal.mockTests} tests</p></div>
                </div>
             </div>
        ) : (
            <div className="text-center py-8"><p className="text-muted-foreground">No goal set for this week.</p></div>
        )}
      </CardContent>
    </Card>
  )
}

function MonthlyGoals() {
    const [goals, setGoals] = useGoals();
    const [subjects, , loadingSubjects] = useSubjects();
    const [progress] = useProgress();
    const [open, setOpen] = useState(false);

    const today = new Date();
    const monthStart = format(startOfMonth(today), 'yyyy-MM');

    const currentMonthlyGoal = goals.monthly.find(g => g.month === monthStart);

    const form = useForm<z.infer<typeof monthlyGoalSchema>>({
        resolver: zodResolver(monthlyGoalSchema),
    });

    useEffect(() => {
        const defaultValues = {
            month: monthStart,
            milestones: subjects.map(s => {
                const existing = currentMonthlyGoal?.milestones.find(m => m.subjectId === s.id);
                return existing || { subjectId: s.id, targetCompletion: 25 };
            }),
        };
        form.reset(defaultValues);
    }, [currentMonthlyGoal, subjects, monthStart, form]);

    const { fields } = useFieldArray({ control: form.control, name: 'milestones' });

    const onSubmit = (data: z.infer<typeof monthlyGoalSchema>) => {
        const updatedMonthlyGoals = goals.monthly.filter(g => g.month !== data.month);
        setGoals({ ...goals, monthly: [...updatedMonthlyGoals, data] });
        setOpen(false);
    };

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
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>This Month&apos;s Goals ({format(today, 'MMMM yyyy')})</CardTitle>
                        <CardDescription>High-level milestones for the month.</CardDescription>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader><DialogTitle>Edit Monthly Goals</DialogTitle></DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                  <ScrollArea className="max-h-[70vh] p-1">
                                    <div className="pr-4 space-y-4">
                                        <h4 className="text-sm font-medium mb-2">Subject Completion Milestones</h4>
                                        <div className="space-y-2">
                                            {fields.map((field, index) => {
                                                const subject = subjects.find(s => s.id === field.subjectId);
                                                if (!subject) return null;
                                                return (
                                                    <div key={field.id} className="flex items-center gap-2">
                                                        <Label className="flex-1" style={{ color: subject.color }}>{subject.name}</Label>
                                                        <FormField control={form.control} name={`milestones.${index}.targetCompletion`} render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <div className="flex items-center gap-1">
                                                                        <Input type="number" className="w-20 h-8" {...field} />
                                                                        <span>%</span>
                                                                    </div>
                                                                </FormControl>
                                                            </FormItem>
                                                        )} />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    </ScrollArea>
                                    <Button type="submit">Save Goals</Button>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {currentMonthlyGoal ? (
                    currentMonthlyGoal.milestones.map(m => {
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
                    })
                ) : (
                    <div className="text-center py-8"><p className="text-muted-foreground">No goals set for this month.</p></div>
                )}
            </CardContent>
        </Card>
    );
}

export default function GoalsPage() {
  const [subjects] = useSubjects();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Goals</h1>
          <p className="text-muted-foreground">Set and track your academic targets.</p>
        </div>
      </div>
      
      {subjects.length > 0 ? (
        <Tabs defaultValue="exam" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="exam">Exam</TabsTrigger>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          <TabsContent value="exam">
            <ExamGoals />
          </TabsContent>
          <TabsContent value="daily">
            <DailyGoals />
          </TabsContent>
          <TabsContent value="weekly">
            <WeeklyGoals />
          </TabsContent>
          <TabsContent value="monthly">
            <MonthlyGoals />
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                <Target className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Set Up Subjects First</h3>
                <p className="text-muted-foreground">You need to add subjects before you can set goals for them.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
