
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSubjects, useProgress } from '@/hooks/use-app-data';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookCopy, Edit, PlusCircle, Trash2, Languages } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { Subject, Chapter, Topic, UserProgress } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { generateAndSeedSyllabus } from '@/ai/flows/generate-syllabus-flow';

const chapterSchema = z.object({
  name: z.string().min(1, 'Chapter name is required.'),
});

function ChapterForm({
  subjectId,
  onSave,
  chapter,
}: {
  subjectId: string;
  onSave: (subjectId: string, chapter: Chapter) => void;
  chapter?: Chapter;
}) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof chapterSchema>>({
    resolver: zodResolver(chapterSchema),
    defaultValues: chapter || { name: '' },
  });

  const onSubmit = (data: z.infer<typeof chapterSchema>) => {
    const chapterData: Chapter = chapter
      ? { ...chapter, name: data.name }
      : { id: nanoid(), name: data.name, topics: [] };
    onSave(subjectId, chapterData);
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {chapter ? (
          <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-4 w-4" /></Button>
        ) : (
          <Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Chapter</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{chapter ? 'Edit Chapter' : 'Add Chapter'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chapter Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Vectors" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


const topicFormSchema = z.object({
  name: z.string().min(1, 'Topic name cannot be empty.'),
});

function TopicItem({
  topic,
  progress,
  subjectId,
  chapterId,
  onUpdateTopic,
  onDeleteTopic,
  onUpdateProgress,
}: {
  topic: Topic;
  progress?: UserProgress[string];
  subjectId: string;
  chapterId: string;
  onUpdateTopic: (subjectId: string, chapterId: string, topic: Topic) => void;
  onDeleteTopic: (subjectId: string, chapterId: string, topicId: string) => void;
  onUpdateProgress: (topicId: string, newProgress: UserProgress[string]) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const form = useForm<z.infer<typeof topicFormSchema>>({
    resolver: zodResolver(topicFormSchema),
    defaultValues: { name: topic.name },
  });

  const handleEditSubmit = (data: z.infer<typeof topicFormSchema>) => {
    onUpdateTopic(subjectId, chapterId, { ...topic, name: data.name });
    setIsEditing(false);
  };
  
  const currentProgress = progress || { status: 'not-started', priority: 'medium', difficulty: null, completedDate: null, timeSpent: 0, notes: '', revisionDates: [] };

  return (
    <div className="flex items-center space-x-4 rounded-md p-2 hover:bg-muted group">
      {isEditing ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleEditSubmit)} className="flex-1 flex items-center gap-2">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl><Input {...field} className="h-8" /></FormControl>
              </FormItem>
            )} />
            <Button type="submit" size="sm">Save</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
          </form>
        </Form>
      ) : (
        <>
          <div className="flex-1">
            <p className="text-sm font-medium leading-none">{topic.name}</p>
          </div>
          <Select
            value={currentProgress.status}
            onValueChange={(status) => onUpdateProgress(topic.id, { ...currentProgress, status: status as UserProgress[string]['status'] })}
          >
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not-started">Not Started</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="revision">Revision</SelectItem>
            </SelectContent>
          </Select>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(true)}><Edit className="h-4 w-4" /></Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Topic?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the topic "{topic.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDeleteTopic(subjectId, chapterId, topic.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </div>
  );
}

export default function SubjectsPage() {
  const [subjects, { update: updateSubject }, loadingSubjects] = useSubjects();
  const [progress, setProgress] = useProgress();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const subjectsWithProgress = useMemo(() => {
    if (!subjects) return [];
    return subjects
    .sort((a, b) => (a as any).order - (b as any).order)
    .map((subject) => {
      const allTopics = (subject.chapters || []).flatMap((c) => c.topics || []);
      const completedTopics = allTopics.filter(
        (t) => progress[t.id]?.status === 'completed'
      ).length;
      const progressPercentage =
        allTopics.length > 0
          ? Math.round((completedTopics / allTopics.length) * 100)
          : 0;
      return { ...subject, progress: progressPercentage, topicCount: allTopics.length, completedCount: completedTopics };
    });
  }, [subjects, progress]);

  const handleUpdateChapter = (subjectId: string, updatedChapter: Chapter) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;
    const isNew = !(subject.chapters || []).some(c => c.id === updatedChapter.id);
    const updatedChapters = isNew 
      ? [...(subject.chapters || []), updatedChapter]
      : (subject.chapters || []).map(c => c.id === updatedChapter.id ? updatedChapter : c);
    updateSubject(subjectId, { chapters: updatedChapters, totalChapters: updatedChapters.length });
  };
  
  const handleDeleteChapter = (subjectId: string, chapterId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;
    const updatedChapters = (subject.chapters || []).filter(c => c.id !== chapterId);
    updateSubject(subjectId, { chapters: updatedChapters, totalChapters: updatedChapters.length });
  }

  const handleUpdateTopic = (
    subjectId: string,
    chapterId: string,
    updatedTopic: Topic
  ) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;
    const updatedChapters = (subject.chapters || []).map(c => c.id === chapterId ? {
        ...c,
        topics: (c.topics || []).map(t => t.id === updatedTopic.id ? updatedTopic : t)
    } : c);
    updateSubject(subjectId, { chapters: updatedChapters });
  };
  
  const handleAddTopic = (subjectId: string, chapterId: string, topicName: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;
    const newTopic: Topic = { id: nanoid(), name: topicName };
    const updatedChapters = (subject.chapters || []).map(c => c.id === chapterId ? {
        ...c,
        topics: [...(c.topics || []), newTopic]
    } : c);
    updateSubject(subjectId, { chapters: updatedChapters });
  };

  const handleDeleteTopic = (subjectId: string, chapterId: string, topicId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;
    const updatedChapters = (subject.chapters || []).map(c => c.id === chapterId ? {
        ...c,
        topics: (c.topics || []).filter(t => t.id !== topicId)
    } : c);
    updateSubject(subjectId, { chapters: updatedChapters });
  }

  const handleUpdateProgress = (topicId: string, newProgress: UserProgress[string]) => {
    setProgress({ ...progress, [topicId]: newProgress });
  }

  const handleSeedSyllabus = async () => {
    setIsSeeding(true);
    toast({
        title: 'Seeding Syllabus...',
        description: 'Please wait while we populate the database with the official HSC syllabus.',
    });
    try {
        const result = await generateAndSeedSyllabus();
        toast({
            title: 'Syllabus Seeded Successfully!',
            description: `${result.subjectCount} subjects have been loaded into the database. The page will now reload.`,
        });
        // Force a reload to fetch new data
        window.location.reload();
    } catch (error) {
        console.error("Syllabus seeding failed:", error);
        toast({
            variant: 'destructive',
            title: 'Seeding Failed',
            description: 'There was an error populating the syllabus. Please try again.',
        });
    } finally {
        setIsSeeding(false);
    }
  }


  if (loadingSubjects) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <Skeleton className="h-10 w-64" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
        </div>
    );
  }

  if (subjects.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Subjects & Syllabus</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center gap-4 text-center py-10 border-2 border-dashed rounded-lg">
                    <BookCopy className="w-12 h-12 text-muted-foreground" />
                    <p className="font-semibold">The syllabus has not been loaded into the database.</p>
                    <p className="text-sm text-muted-foreground">Please click the button below to seed the official syllabus.</p>
                    <Button onClick={handleSeedSyllabus} disabled={isSeeding}>
                        {isSeeding ? 'Seeding...' : 'Seed Syllabus'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Subjects & Syllabus</h1>
          <p className="text-muted-foreground">Manage your subjects, chapters, and topics to track your progress.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline">
                <Languages className="mr-2 h-4 w-4" />
                English
            </Button>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {subjectsWithProgress.map((subject) => (
          <AccordionItem value={subject.id} key={subject.id} className="border-b-0">
            <Card>
                <AccordionTrigger className="w-full p-4 hover:no-underline [&[data-state=open]]:border-b">
                    <div className="flex items-center gap-4 flex-1">
                    <div
                        className="h-8 w-1.5 rounded-full"
                        style={{ backgroundColor: subject.color }}
                    ></div>
                    <div className="flex-1 text-left">
                        <p className="text-xl font-semibold leading-none tracking-tight">{subject.name}</p>
                        <p className="text-sm text-muted-foreground">
                        {subject.completedCount} / {subject.topicCount} topics completed
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <span className="font-bold">{subject.progress}%</span>
                            <Progress value={subject.progress} indicatorColor={subject.color} className="w-24 h-1.5" />
                        </div>
                    </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-0">
                    <div className="p-2 flex justify-end gap-2 border-b mb-2">
                       <ChapterForm subjectId={subject.id} onSave={handleUpdateChapter} />
                    </div>
                    <div className="p-4 pt-0 space-y-2">
                      {(subject.chapters || []).map((chapter) => (
                          <Accordion
                          key={chapter.id}
                          type="single"
                          collapsible
                          className="border rounded-md px-4 bg-muted/50"
                          >
                          <AccordionItem value={chapter.id} className="border-b-0">
                              <AccordionTrigger className="group/chapter-trigger">
                                <span className="flex-1 text-left">{chapter.name}</span>
                                <div className="opacity-0 group-hover/chapter-trigger:opacity-100 transition-opacity flex items-center">
                                  <ChapterForm subjectId={subject.id} chapter={chapter} onSave={handleUpdateChapter} />
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Chapter?</AlertDialogTitle>
                                        <AlertDialogDescription>Are you sure you want to delete "{chapter.name}" and all its topics? This is irreversible.</AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteChapter(subject.id, chapter.id)}>Delete</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="space-y-2">
                              {(chapter.topics || []).map((topic) => (
                                  <TopicItem
                                  key={topic.id}
                                  topic={topic}
                                  progress={progress[topic.id]}
                                  subjectId={subject.id}
                                  chapterId={chapter.id}
                                  onUpdateTopic={handleUpdateTopic}
                                  onDeleteTopic={handleDeleteTopic}
                                  onUpdateProgress={handleUpdateProgress}
                                  />
                              ))}
                              <AddTopicForm subjectId={subject.id} chapterId={chapter.id} onAddTopic={handleAddTopic} />
                              </AccordionContent>
                          </AccordionItem>
                          </Accordion>
                      ))}
                    </div>
                </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function AddTopicForm({ subjectId, chapterId, onAddTopic }: { subjectId: string; chapterId: string; onAddTopic: (subjectId: string, chapterId: string, topicName: string) => void }) {
  const [open, setOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(z.object({ name: z.string().min(1, 'Topic name is required.') })),
    defaultValues: { name: '' },
  });

  const onSubmit = (data: { name: string }) => {
    onAddTopic(subjectId, chapterId, data.name);
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full mt-2">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Topic
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Topic</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Newton's Laws" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Add Topic</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
