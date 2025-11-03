import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProgressPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress & Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is where you will see detailed analytics and charts about your study progress.</p>
        <p className="text-muted-foreground">Feature coming soon!</p>
      </CardContent>
    </Card>
  );
}
