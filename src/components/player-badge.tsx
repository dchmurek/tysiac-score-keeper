import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PlayerBadgeProps {
  name: string;
  isGuest?: boolean;
  size?: "sm" | "md";
  status?: "confirmed" | "pending" | "auto";
}

export function PlayerBadge({ name, isGuest, size = "md", status }: PlayerBadgeProps) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center gap-2">
      <Avatar className={cn(size === "sm" ? "h-6 w-6" : "h-8 w-8")}>
        <AvatarFallback
          className={cn(
            "font-semibold",
            isGuest ? "bg-warning/30 text-warning-foreground" : "bg-primary/10 text-primary",
            size === "sm" && "text-[10px]",
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className={cn("font-medium", size === "sm" ? "text-xs" : "text-sm")}>{name}</span>
      {isGuest && (
        <Badge variant="outline" className="border-warning/40 text-[10px] text-warning-foreground">
          Guest
        </Badge>
      )}
      {status === "pending" && (
        <Badge variant="outline" className="text-[10px]">Pending</Badge>
      )}
      {status === "confirmed" && (
        <Badge variant="secondary" className="text-[10px]">Confirmed</Badge>
      )}
      {status === "auto" && (
        <Badge variant="secondary" className="text-[10px]">Auto-confirmed</Badge>
      )}
    </div>
  );
}
