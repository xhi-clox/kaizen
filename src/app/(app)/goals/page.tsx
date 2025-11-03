'use client';

import { useGoals, useProfile, useSubjects } from '@/hooks/use-app-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Edit, Flag, Target, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';

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

function ExamGoals() {
  const [{ examDate: profileExamDate, targetGPA: profileGpa }, setProfile] = useProfile();
  const [goals, setGoals] = useGoals();
  const [subjects] = useSubjects();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof examGoalSchema>>({
    resolver: zodResolver(examGoalSchema),
    defaultValues: {
      targetGPA: goals.exam.targetGPA || profileGpa,
      examDate: goals.exam.examDate || profileExamDate,
      subjectTargets: subjects.map(s => {
        const existing = goals.exam.subjectTargets.find(t => t.subjectId === s.id);
        return existing || { subjectId: s.id, targetMarks: 80 };
      }),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'subjectTargets',
  });

  const onSubmit = (data: z.infer<typeof examGoalSchema>) => {
    setGoals({ ...goals, exam: data });
    setProfile(p => ({ ...p, examDate: data.examDate, targetGPA: data.targetGPA }));
    setOpen(false);
  };

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
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto p-1">
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
              {goals.exam.targetGPA.toFixed(2)} / 5.00
            </span>
          </div>
          <Progress value={gpaProgress} />
        </div>
        <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Subject Targets</h4>
            {goals.exam.subjectTargets.map(target => {
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
        <div className="grid gap-6">
            <ExamGoals />
            {/* Placeholder for other goal types */}
            <Card>
                <CardHeader><CardTitle>Daily, Weekly, Monthly Goals</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Feature coming soon!</p></CardContent>
            </Card>
        </div>
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