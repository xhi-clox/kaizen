
'use client';

import { useRoutine, useSubjects, useSettings, useProfile } from '@/hooks/use-app-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { BrainCircuit, CalendarDays, Edit, PlusCircle, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Routine, RoutineSlot, WeekDay } from '@/lib/types';
import { nanoid } from 'nanoid';
import { useState } from 'react';
import { WEEK_DAYS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

import { generateAdaptiveRoutine, type AdaptiveRoutineInput } from '@/ai/flows/adaptive-routine-generation';

const slotSchema = z.object({
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  subjectId: z.string(),
  activity: z.enum(['study', 'revision', 'practice', 'break', 'prayer', 'other']),
});

function RoutineSlotForm({ day, onSave, slot }: { day: WeekDay; onSave: (day: WeekDay, slot: RoutineSlot) => void; slot?: RoutineSlot }) {
  const [open, setOpen] = useState(false);
  const [subjects] = useSubjects();
  
  const form = useForm<z.infer<typeof slotSchema>>({
    resolver: zodResolver(slotSchema),
    defaultValues: slot || { startTime: '09:00', endTime: '10:00', subjectId: '', activity: 'study' },
  });

  const onSubmit = (data: z.infer<typeof slotSchema>) => {
    const newSlot: RoutineSlot = { id: slot?.id || nanoid(), isFlexible: false, ...data };
    onSave(day, newSlot);
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {slot ? <Button variant="ghost" size="icon" className="h-6 w-6"><Edit className="h-3 w-3" /></Button> : <Button variant="ghost" className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Add Slot</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{slot ? 'Edit' : 'Add'} Time Slot</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField name="startTime" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl><Input type="time" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="endTime" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl><Input type="time" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField name="subjectId" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Subject / Activity</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="break">Break</SelectItem>
                    <SelectItem value="prayer">Prayer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name="activity" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select activity type..." /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="study">Study</SelectItem>
                    <SelectItem value="revision">Revision</SelectItem>
                    <SelectItem value="practice">Practice</SelectItem>
                     <SelectItem value="break">Break</SelectItem>
                    <SelectItem value="prayer">Prayer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="submit">Save Slot</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function RoutinePage() {
  const [routine, setRoutine] = useRoutine();
  const [subjects] = useSubjects();
  const [settings] = useSettings();
  const [profile] = useProfile();
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleSaveSlot = (day: WeekDay, slot: RoutineSlot) => {
    const newRoutine = {
      ...routine,
      weekSchedule: routine.weekSchedule.map(d =>
        d.day === day
          ? { ...d, slots: [...d.slots.filter(s => s.id !== slot.id), slot].sort((a, b) => a.startTime.localeCompare(b.startTime)) }
          : d
      )
    };
    setRoutine(newRoutine);
  };
  
  const handleDeleteSlot = (day: WeekDay, slotId: string) => {
    const newRoutine = {
      ...routine,
      weekSchedule: routine.weekSchedule.map(d =>
        d.day === day
          ? { ...d, slots: d.slots.filter(s => s.id !== slotId) }
          : d
      )
    };
    setRoutine(newRoutine);
  }

  const handleGenerateRoutine = async () => {
    setIsGenerating(true);
    if (!profile || !settings || !subjects) {
        toast({
            variant: "destructive",
            title: "Data not loaded",
            description: "Please wait for all data to load before generating a routine.",
        });
        setIsGenerating(false);
        return;
    }
    try {
        const input: AdaptiveRoutineInput = {
            examDate: profile.examDate,
            availableStudyHoursPerDay: settings.dailyStudyHoursGoal,
            subjectPriorities: subjects.reduce((acc, s) => ({...acc, [s.id]: 'medium'}), {}), // This could be more dynamic
            syllabus: subjects,
        }
        const result = await generateAdaptiveRoutine(input);

        // Merge AI routine with existing routine, adding nano Ids
        const newSchedule = result.weeklySchedule.map(daySchedule => ({
            ...daySchedule,
            slots: daySchedule.slots.map(slot => ({...slot, id: nanoid()}))
        }))

        setRoutine({ weekSchedule: newSchedule });

        toast({
            title: "AI Routine Generated!",
            description: "Your new adaptive study routine is ready.",
        });

    } catch (error) {
        console.error("Error generating routine:", error);
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "Could not generate the AI routine. Please try again.",
        });
    } finally {
        setIsGenerating(false);
    }
  }


  return (
    <div className="space-y-6">
       <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Routine Planner</h1>
          <p className="text-muted-foreground">Plan your weekly study schedule for success.</p>
        </div>
        <Button onClick={handleGenerateRoutine} disabled={isGenerating}>
          <BrainCircuit className="mr-2 h-4 w-4" />
          {isGenerating ? 'Generating...' : 'Generate with AI'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {WEEK_DAYS.map(day => {
          const daySchedule = routine.weekSchedule.find(d => d.day === day);
          const getSubject = (slot: RoutineSlot) => {
            if (['break', 'prayer', 'other'].includes(slot.subjectId)) {
                return { name: slot.subjectId.charAt(0).toUpperCase() + slot.subjectId.slice(1), color: '#888' };
            }
            return subjects.find(s => s.id === slot.subjectId);
          }

          return (
            <Card key={day}>
              <CardHeader>
                <CardTitle className="capitalize">{day}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {daySchedule?.slots.map(slot => {
                  const subject = getSubject(slot);
                  return (
                    <div key={slot.id} className="text-sm p-2 rounded-md border" style={{ borderLeft: `4px solid ${subject?.color || '#ccc'}`}}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold">{subject?.name || 'Unnamed Activity'}</p>
                                <p className="text-xs text-muted-foreground">{slot.startTime} - {slot.endTime}</p>
                            </div>
                            <div className="flex items-center">
                                <RoutineSlotForm day={day} slot={slot} onSave={handleSaveSlot} />
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteSlot(day, slot.id)}>
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                  );
                })}
                <RoutineSlotForm day={day} onSave={handleSaveSlot} />
              </CardContent>
            </Card>
          )
        })}
      </div>

    </div>
  );
}
