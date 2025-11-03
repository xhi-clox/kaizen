
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useSubjects } from '@/hooks/use-app-data';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookCopy, CheckCircle, Edit, PlusCircle, Trash2, BrainCircuit } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { generateSyllabus } from '@/ai/flows/generate-syllabus-flow';


import type { Subject, Chapter, Topic } from '@/lib/types';
import { NCTB_SUBJECTS } from '@/lib/constants';

const subjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required.'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Please select a valid color.'),
  totalChapters: z.coerce.number().min(1, 'Must have at least one chapter.'),
});

const chapterSchema = z.object({
  name: z.string().min(1, 'Chapter name is required.'),
});

const topicSchema = z.object({
  name: z.string().min(1, 'Topic name is required.'),
  priority: z.enum(['low', 'medium', 'high']),
});

const statusColors = {
  'not-started': 'bg-gray-200 text-gray-800',
  'in-progress': 'bg-yellow-200 text-yellow-800',
  completed: 'bg-green-200 text-green-800',
  revision: 'bg-purple-200 text-purple-800',
};

function SubjectForm({
  onSave,
  subject,
}: {
  onSave: (data: Subject) => void;
  subject?: Subject;
}) {
  const [open, setOpen] = useState(false);
  const [subjects] = useSubjects();

  const form = useForm<z.infer<typeof subjectSchema>>({
    resolver: zodResolver(subjectSchema),
    defaultValues: subject || {
      name: '',
      color: '#3498db',
      totalChapters: 10,
    },
  });

  const onSubmit = (data: z.infer<typeof subjectSchema>) => {
    const existingSubject = subjects.find(s => s.name.toLowerCase() === data.name.toLowerCase() && s.id !== subject?.id);
    if (existingSubject) {
      form.setError('name', { message: 'Subject already exists.'});
      return;
    }

    const newSubjectData: Subject = {
      id: subject?.id || nanoid(),
      chapters:
        subject?.chapters ||
        Array.from({ length: data.totalChapters }, (_, i) => ({
          id: nanoid(),
          name: `Chapter ${i + 1}`,
          topics: [],
        })),
      ...data,
    };
    onSave(newSubjectData);
    setOpen(false);
    form.reset();
  };

  const handleSelectNCTBSubject = (subjectName: string) => {
    const selected = NCTB_SUBJECTS.find(s => s.name === subjectName);
    if(selected) {
        form.setValue('name', selected.name);
        form.setValue('color', selected.color);
        form.setValue('totalChapters', selected.totalChapters);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {subject ? (
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Subject
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{subject ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
          <DialogDescription>
            {subject
              ? 'Update the details of your subject.'
              : 'Add a new subject to your syllabus.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <Label>Quick Add NCTB Subject</Label>
            <Select onValueChange={handleSelectNCTBSubject}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a subject to quick-add" />
                </SelectTrigger>
                <SelectContent>
                    {NCTB_SUBJECTS.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Physics" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Input type="color" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!subject && (
              <FormField
                control={form.control}
                name="totalChapters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Chapters</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="e.g., 12"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function TopicItem({
  topic,
  onUpdate,
}: {
  topic: Topic;
  onUpdate: (topic: Topic) => void;
}) {
  return (
    <div className="flex items-center space-x-4 rounded-md p-2 hover:bg-muted">
      <Checkbox
        id={`topic-${topic.id}`}
        checked={topic.status === 'completed'}
        onCheckedChange={(checked) =>
          onUpdate({
            ...topic,
            status: checked ? 'completed' : 'not-started',
            completedDate: checked ? Date.now() : null,
          })
        }
      />
      <div className="flex-1">
        <label
          htmlFor={`topic-${topic.id}`}
          className={`text-sm font-medium leading-none ${
            topic.status === 'completed' ? 'line-through text-muted-foreground' : ''
          }`}
        >
          {topic.name}
        </label>
      </div>
      <Select
        value={topic.status}
        onValueChange={(status) => onUpdate({ ...topic, status: status as Topic['status'] })}
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
    </div>
  );
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useSubjects();
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const subjectsWithProgress = useMemo(() => {
    return subjects.map((subject) => {
      const allTopics = subject.chapters.flatMap((c) => c.topics);
      const completedTopics = allTopics.filter(
        (t) => t.status === 'completed'
      ).length;
      const progress =
        allTopics.length > 0
          ? Math.round((completedTopics / allTopics.length) * 100)
          : 0;
      return { ...subject, progress, topicCount: allTopics.length, completedCount: completedTopics };
    });
  }, [subjects]);

  const handleAddSubject = (subject: Subject) => {
    setSubjects([...subjects, subject]);
  };

  const handleUpdateSubject = (updatedSubject: Subject) => {
    setSubjects(
      subjects.map((s) => (s.id === updatedSubject.id ? updatedSubject : s))
    );
  };

  const handleDeleteSubject = (subjectId: string) => {
    setSubjects(subjects.filter((s) => s.id !== subjectId));
  };

  const handleUpdateChapter = (
    subjectId: string,
    updatedChapter: Chapter
  ) => {
    setSubjects(
      subjects.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              chapters: s.chapters.map((c) =>
                c.id === updatedChapter.id ? updatedChapter : c
              ),
            }
          : s
      )
    );
  };

  const handleUpdateTopic = (
    subjectId: string,
    chapterId: string,
    updatedTopic: Topic
  ) => {
    setSubjects(
      subjects.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              chapters: s.chapters.map((c) =>
                c.id === chapterId
                  ? {
                      ...c,
                      topics: c.topics.map((t) =>
                        t.id === updatedTopic.id ? updatedTopic : t
                      ),
                    }
                  : c
              ),
            }
          : s
      )
    );
  };
  
  const handleAddTopic = (subjectId: string, chapterId: string, topic: Topic) => {
    setSubjects(
      subjects.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              chapters: s.chapters.map((c) =>
                c.id === chapterId
                  ? { ...c, topics: [...c.topics, topic] }
                  : c
              ),
            }
          : s
      )
    );
  };

  const handleGenerateSyllabus = async () => {
    setIsGenerating(true);
    toast({
        title: 'Generating Syllabus...',
        description: 'The AI is building your complete syllabus. This may take a moment.',
    });
    try {
        const result = await generateSyllabus({ curriculumName: 'NCTB HSC Science Group' });
        setSubjects(result.subjects as Subject[]);
        toast({
            title: 'Syllabus Generated!',
            description: 'Your new AI-generated syllabus has been loaded.',
        });
    } catch (error) {
        console.error("Error generating syllabus:", error);
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "Could not generate the syllabus. Please try again.",
        });
    } finally {
        setIsGenerating(false);
    }
  }


  if (subjects.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Subjects & Syllabus</CardTitle>
                <CardDescription>Manage your subjects, chapters, and topics to track your progress.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center gap-4 text-center py-10 border-2 border-dashed rounded-lg">
                    <BookCopy className="w-12 h-12 text-muted-foreground" />
                    <p className="text-muted-foreground">You haven&apos;t added any subjects yet. Add one manually or let AI generate it for you.</p>
                    <div className="flex gap-2">
                        <SubjectForm onSave={handleAddSubject} />
                        <Button variant="outline" onClick={handleGenerateSyllabus} disabled={isGenerating}>
                            <BrainCircuit className="mr-2 h-4 w-4" />
                            {isGenerating ? 'Generating...' : 'Generate with AI'}
                        </Button>
                    </div>
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
            <SubjectForm onSave={handleAddSubject} />
            <Button variant="outline" onClick={handleGenerateSyllabus} disabled={isGenerating}>
                <BrainCircuit className="mr-2 h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Generate with AI'}
            </Button>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {subjectsWithProgress.map((subject) => (
          <AccordionItem value={subject.id} key={subject.id} className="border-b-0 rounded-lg bg-card shadow-sm border">
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
                <Card>
                    <CardHeader className="flex-row items-center justify-end gap-2 p-2">
                        <SubjectForm
                            subject={subject}
                            onSave={handleUpdateSubject}
                        />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This will permanently delete the subject &quot;{subject.name}&quot; and all its chapters and topics. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteSubject(subject.id)}>
                                Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-2">
                      {subject.chapters.map((chapter) => (
                          <Accordion
                          key={chapter.id}
                          type="single"
                          collapsible
                          className="border rounded-md px-4"
                          >
                          <AccordionItem value={chapter.id} className="border-b-0">
                              <AccordionTrigger>
                              {chapter.name}
                              </AccordionTrigger>
                              <AccordionContent className="space-y-2">
                              {chapter.topics.map((topic) => (
                                  <TopicItem
                                  key={topic.id}
                                  topic={topic}
                                  onUpdate={(updatedTopic) =>
                                      handleUpdateTopic(
                                      subject.id,
                                      chapter.id,
                                      updatedTopic
                                      )
                                  }
                                  />
                              ))}
                              <AddTopicForm subjectId={subject.id} chapterId={chapter.id} onAddTopic={handleAddTopic} />
                              </AccordionContent>
                          </AccordionItem>
                          </Accordion>
                      ))}
                    </CardContent>
                </Card>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function AddTopicForm({ subjectId, chapterId, onAddTopic }: { subjectId: string; chapterId: string; onAddTopic: (subjectId: string, chapterId: string, topic: Topic) => void }) {
  const [open, setOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(z.object({ name: z.string().min(1, 'Topic name is required.') })),
    defaultValues: { name: '' },
  });

  const onSubmit = (data: { name: string }) => {
    const newTopic: Topic = {
      id: nanoid(),
      name: data.name,
      status: 'not-started',
      priority: 'medium',
      difficulty: null,
      completedDate: null,
      revisionDates: [],
      timeSpent: 0,
      notes: '',
    };
    onAddTopic(subjectId, chapterId, newTopic);
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
