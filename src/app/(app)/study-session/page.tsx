import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudySessionPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Session Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is where you will track your study sessions with a timer.</p>
        <p className="text-muted-foreground">Feature coming soon!</p>
      </CardContent>
    </Card>
  );
}
