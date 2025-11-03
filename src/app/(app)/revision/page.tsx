import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RevisionPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revision System</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is where you will find your personalized revision queue and manage weak topics.</p>
        <p className="text-muted-foreground">Feature coming soon!</p>
      </CardContent>
    </Card>
  );
}
