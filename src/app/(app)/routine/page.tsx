import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RoutinePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Routine Planner</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is where you will plan your weekly study routine and use AI to generate an adaptive one.</p>
        <p className="text-muted-foreground">Feature coming soon!</p>
      </CardContent>
    </Card>
  );
}
