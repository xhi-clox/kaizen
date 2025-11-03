'use client';

import { useSettings, useProfile, useAppData } from '@/hooks/use-app-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  examDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
  targetGPA: z.coerce.number().min(1).max(5),
});

const settingsSchema = z.object({
  dailyStudyHoursGoal: z.coerce.number().min(0).max(24),
  pomodoro: z.object({
    work: z.coerce.number().min(5),
    shortBreak: zcoerce.number().min(1),
    longBreak: z.coerce.number().min(5),
  }),
});

export default function SettingsPage() {
  const [profile, setProfile] = useProfile();
  const [settings, setSettings] = useSettings();
  const { resetData } = useAppData();
  const { toast } = useToast();
  const router = useRouter();

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile,
  });

  const settingsForm = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
  });

  function onProfileSubmit(data: z.infer<typeof profileSchema>) {
    setProfile(data);
    toast({ title: 'Profile updated successfully!' });
  }

  function onSettingsSubmit(data: z.infer<typeof settingsSchema>) {
    setSettings(data);
    toast({ title: 'Settings saved successfully!' });
  }

  const handleReset = () => {
    resetData();
    toast({ title: "Application Reset", description: "All your data has been cleared." });
    router.push('/');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your personal information.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
                  name="examDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="targetGPA"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target GPA</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="1" max="5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit">Save Profile</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Study Settings</CardTitle>
          <CardDescription>Customize your study session parameters.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...settingsForm}>
            <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-4">
              <FormField
                control={settingsForm.control}
                name="dailyStudyHoursGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Study Goal (hours)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="24" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={settingsForm.control}
                  name="pomodoro.work"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work (mins)</FormLabel>
                      <FormControl>
                        <Input type="number" min="5" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={settingsForm.control}
                  name="pomodoro.shortBreak"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Break (mins)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={settingsForm.control}
                  name="pomodoro.longBreak"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Long Break (mins)</FormLabel>
                      <FormControl>
                        <Input type="number" min="5" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormMessage>{settingsForm.formState.errors.pomodoro?.message}</FormMessage>
              <Button type="submit">Save Settings</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>These actions are irreversible. Please proceed with caution.</CardDescription>
          </CardHeader>
          <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">Reset All Data</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all your study data, goals, and settings.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleReset}>Yes, reset everything</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
          </CardContent>
      </Card>

    </div>
  );
}