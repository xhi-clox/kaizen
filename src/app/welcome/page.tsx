'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Rocket, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AppLogo } from '@/components/app-logo';
import { useAppData } from '@/hooks/use-app-data';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  examDate: z.date({
    required_error: 'Exam date is required.',
  }),
});

export default function WelcomePage() {
  const router = useRouter();
  const { setupQuickStart, setupFreshStart } = useAppData();
  const { toast } = useToast();
  const [loading, setLoading] = useState<null | 'quick' | 'fresh'>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      examDate: undefined, // Set to undefined initially to avoid hydration mismatch
    },
  });

  // Set default exam date on client side to avoid hydration error
  useEffect(() => {
    form.setValue('examDate', new Date(new Date().setMonth(new Date().getMonth() + 6)));
  }, [form]);


  function handleQuickStart(values: z.infer<typeof FormSchema>) {
    setLoading('quick');
    try {
        const dateString = format(values.examDate, 'yyyy-MM-dd');
        setupQuickStart(values.name, dateString);
        toast({
            title: 'Welcome to HSC Success Planner!',
            description: "We've set up some sample data for you.",
        });
        router.push('/dashboard');
    } catch(e) {
        console.error(e);
        toast({
            title: 'Uh oh!',
            description: "Something went wrong setting up your account.",
            variant: 'destructive',
        });
        setLoading(null);
    }
  }
  
  function handleFreshStart(values: z.infer<typeof FormSchema>) {
    setLoading('fresh');
    try {
        const dateString = format(values.examDate, 'yyyy-MM-dd');
        setupFreshStart(values.name, dateString);
        toast({
            title: 'Welcome to HSC Success Planner!',
            description: "Your new study plan is ready.",
        });
        router.push('/dashboard');
    } catch(e) {
        console.error(e);
        toast({
            title: 'Uh oh!',
            description: "Something went wrong setting up your account.",
            variant: 'destructive',
        });
        setLoading(null);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-8 left-8">
        <AppLogo />
      </div>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Welcome to HSC Success Planner
          </CardTitle>
          <CardDescription>
            Let&apos;s get you set up for success.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What should we call you?</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="examDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>When is your HSC exam?</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0,0,0,0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col space-y-2 pt-4">
                <Button 
                    type="button" 
                    onClick={form.handleSubmit(handleQuickStart)}
                    disabled={!!loading || !form.formState.isValid}
                    className="w-full"
                >
                  <Rocket />
                  {loading === 'quick' ? 'Setting up...' : 'Quick Start with Sample Data'}
                </Button>
                 <Button 
                    type="button" 
                    onClick={form.handleSubmit(handleFreshStart)}
                    variant="secondary"
                    disabled={!!loading || !form.formState.isValid}
                    className="w-full"
                >
                  <Sparkles />
                   {loading === 'fresh' ? 'Setting up...' : 'Start Fresh'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
