
'use client';

import { useSubjects, useStudySessions, useProgress } from '@/hooks/use-app-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Text } from 'recharts';
import { useMemo, useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { Target, Clock, BookOpen } from 'lucide-react';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CustomYAxisTick = (props: any) => {
    const { x, y, payload, width } = props;
    return (
        <Text 
            x={x} 
            y={y} 
            width={width} 
            textAnchor="end" 
            verticalAnchor="middle" 
            fill="hsl(var(--foreground))" 
            className="text-xs"
        >
            {payload.value}
        </Text>
    );
};


export default function ProgressPage() {
  const [subjects] = useSubjects();
  const [sessions] = useStudySessions();
  const [progress] = useProgress();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const allTopics = useMemo(() => {
    return subjects.flatMap(s => s.chapters.flatMap(c => c.topics));
  }, [subjects]);

  const overallCompletion = useMemo(() => {
    if (allTopics.length === 0) return 0;
    const completed = allTopics.filter(t => progress[t.id]?.status === 'completed').length;
    return (completed / allTopics.length) * 100;
  }, [allTopics, progress]);

  const totalStudyTime = useMemo(() => {
    if (!sessions) return 0;
    return sessions.reduce((acc, s) => acc + s.duration, 0) / 60; // in hours
  }, [sessions]);

  const subjectProgressData = useMemo(() => {
    if (!subjects) return [];
    
    const shortenName = (name: string) => {
        if (name.includes('Information')) return 'ICT';
        
        const replacements: {[key: string]: string} = {
            'Bangla': 'BAN',
            'English': 'ENG',
            'Physics': 'PHY',
            'Chemistry': 'CHEM',
            'Biology': 'BIO',
            'Higher Math': 'H. Math',
            ' 1st Paper': ' 1st',
            ' 2nd Paper': ' 2nd',
        };

        let shortName = name;
        for (const key in replacements) {
            shortName = shortName.replace(key, replacements[key]);
        }
        return shortName;
    }

    return subjects
      .sort((a, b) => (a as any).order - (b as any).order)
      .map(subject => {
        const subjectTopics = (subject.chapters || []).flatMap(c => c.topics);
        if (subjectTopics.length === 0) {
            return {
                name: shortenName(subject.name), 
                progress: 0, 
                fill: subject.color 
            }
        }
        const completed = subjectTopics.filter(t => progress[t.id]?.status === 'completed').length;
        const progressPercentage = (completed / subjectTopics.length) * 100;
        return { 
            name: shortenName(subject.name), 
            progress: Math.round(progressPercentage), 
            fill: subject.color 
        };
      });
  }, [subjects, progress]);

  const weeklyStudyData = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 6 }); // Saturday
    const weekEnd = endOfWeek(today, { weekStartsOn: 6 }); // Friday
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    if (!sessions) return [];

    return days.map(day => {
      const daySessions = sessions.filter(s => isSameDay(new Date(s.date), day));
      const totalMinutes = daySessions.reduce((acc, s) => acc + s.duration, 0);
      return {
        name: format(day, 'EEE'),
        hours: parseFloat((totalMinutes / 60).toFixed(1)),
      };
    });
  }, [sessions]);
  
  const chartConfig = useMemo(() => {
    const config: any = {};
    subjectProgressData.forEach(item => {
        config[item.name] = {
            label: item.name,
            color: item.fill,
        };
    });
    return {
        progress: {
            label: 'Progress',
        },
        ...config,
    };
  }, [subjectProgressData]);

  const subjectCompletionChart = (
    <Card>
      <CardHeader>
        <CardTitle>Subject Completion</CardTitle>
        <CardDescription>Your progress in each subject.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
                data={subjectProgressData} 
                layout="vertical" 
                margin={{ left: 10, right: 30, top: 10, bottom: 10, }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} unit="%" tick={{fontSize: 12}} />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={80}
                tickLine={false} 
                axisLine={false}
                tick={<CustomYAxisTick />}
              />
              <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
              <Bar dataKey="progress" background={{ fill: 'hsl(var(--muted))' }} radius={[4, 4, 4, 4]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );

  const weeklyStudyChart = (
     <Card>
          <CardHeader>
            <CardTitle>This Week&apos;s Study Hours</CardTitle>
            <CardDescription>Your daily study time for the current week.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ hours: { label: 'Hours', color: 'hsl(var(--primary))'}}} className="h-80 sm:h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyStudyData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} tick={{fontSize: 12}} />
                        <YAxis tick={{fontSize: 12}} />
                        <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                        <Bar dataKey="hours" fill="hsl(var(--primary))" radius={4} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Progress & Analytics</h1>
          <p className="text-muted-foreground">Visualize your study habits and track your journey.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallCompletion.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">of syllabus completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudyTime.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">hours logged</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects Mastered</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjectProgressData.filter(s => s.progress === 100).length}</div>
            <p className="text-xs text-muted-foreground">out of {subjects?.length || 0} subjects</p>
          </CardContent>
        </Card>
      </div>
      
      {isClient && (
        <>
          {/* Mobile and Tablet View: Tabs */}
          <div className="lg:hidden">
            <Tabs defaultValue="completion" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="completion">Completion</TabsTrigger>
                <TabsTrigger value="study_hours">Study Hours</TabsTrigger>
              </TabsList>
              <TabsContent value="completion">
                {subjectCompletionChart}
              </TabsContent>
              <TabsContent value="study_hours">
                {weeklyStudyChart}
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop View: Grid */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-6">
            {subjectCompletionChart}
            {weeklyStudyChart}
          </div>
        </>
      )}
    </div>
  );
}
