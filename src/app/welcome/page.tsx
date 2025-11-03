'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Rocket, Sparkles } from 'lucide-react';

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
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
});

type StartType = 'quick' | 'fresh';

export default function WelcomePage() {
  const router = useRouter();
  const { setupQuickStart, setupFreshStart } = useAppData();
  const { toast } = useToast();
  const [loading, setLoading] = useState<StartType | null>(null);
  const [startType, setStartType] = useState<StartType>('quick');
  const [isClient, setIsClient] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  function onSubmit(values: z.infer<typeof FormSchema>) {
    setLoading(startType);
    try {
        if (startType === 'quick') {
            setupQuickStart(values.name);
            toast({
                title: 'Welcome to HSC Success Planner!',
                description: "We've set up some sample data for you.",
            });
        } else {
            setupFreshStart(values.name);
            toast({
                title: 'Welcome to HSC Success Planner!',
                description: "Your new study plan is ready.",
            });
        }
        router.push('/dashboard');
    } catch(e) {
        console.error(e);
        toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: 'There was a problem setting up your account.',
        });
    } finally {
        setLoading(null);
    }
  }

  if (!isClient) {
    return null;
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              <div className="flex flex-col space-y-2 pt-4">
                <Button 
                    type="submit" 
                    onClick={() => setStartType('quick')}
                    disabled={!!loading || !form.formState.isValid}
                    className="w-full"
                >
                  <Rocket />
                  {loading === 'quick' ? 'Setting up...' : 'Quick Start with Sample Data'}
                </Button>
                 <Button 
                    type="submit" 
                    onClick={() => setStartType('fresh')}
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
