import { GraduationCap } from 'lucide-react';

export function AppLogo() {
  return (
    <div className="flex items-center gap-2">
      <GraduationCap className="h-6 w-6 text-sidebar-primary" />
      <h1 className="text-lg font-bold text-sidebar-foreground">
        HSC Success Planner
      </h1>
    </div>
  );
}
