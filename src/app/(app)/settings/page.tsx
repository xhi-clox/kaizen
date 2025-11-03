import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is where you will configure your application preferences and manage your data.</p>
        <p className="text-muted-foreground">Feature coming soon!</p>
      </CardContent>
    </Card>
  );
}
