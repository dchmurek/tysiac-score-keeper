import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface StatsCardProps {
  label: string;
  value: string | number;
  hint?: string;
  emphasis?: boolean;
  className?: string;
}

export function StatsCard({ label, value, hint, emphasis, className }: StatsCardProps) {
  return (
    <Card className={cn("p-4", emphasis && "bg-primary text-primary-foreground", className)}>
      <p className={cn("text-xs font-medium uppercase tracking-wide", emphasis ? "text-primary-foreground/80" : "text-muted-foreground")}>
        {label}
      </p>
      <p className="mt-1.5 font-display text-2xl font-bold tabular-nums sm:text-3xl">{value}</p>
      {hint && <p className={cn("mt-0.5 text-xs", emphasis ? "text-primary-foreground/70" : "text-muted-foreground")}>{hint}</p>}
    </Card>
  );
}
