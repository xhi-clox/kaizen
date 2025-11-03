import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GoalsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Goals</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is where you will set and track your daily, weekly, monthly, and exam goals.</p>
        <p className="text-muted-foreground">Feature coming soon!</p>
      </CardContent>
    </Card>
  );
}
