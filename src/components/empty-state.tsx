import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <Card
      className={cn("flex flex-col items-center justify-center gap-3 p-8 text-center", className)}
    >
      {icon && (
        <div className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
      )}
      <div>
        <h3 className="font-display text-base font-semibold">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </Card>
  );
}
