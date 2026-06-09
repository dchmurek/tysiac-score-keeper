import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, TrendingUp, AlertTriangle } from "lucide-react";

interface TeamCardProps {
  teamName: string;
  players: string[];
  score: number;
  team: "A" | "B";
  leading?: boolean;
  capped?: boolean;
  winner?: boolean;
  compact?: boolean;
}

export function TeamCard({
  teamName,
  players,
  score,
  team,
  leading,
  capped,
  winner,
  compact,
}: TeamCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-2 p-5 transition-shadow",
        winner ? "border-success bg-success/5 shadow-lg" : "border-border",
      )}
    >
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: team === "A" ? "var(--team-a)" : "var(--team-b)" }}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: team === "A" ? "var(--team-a)" : "var(--team-b)" }}
            />
            <h3 className="font-display text-base font-semibold">{teamName}</h3>
            {winner && <Crown className="h-4 w-4 text-success" />}
          </div>
          <p className="mt-1 truncate text-sm text-muted-foreground">{players.join(" + ")}</p>
        </div>
        {leading && !winner && (
          <Badge variant="secondary" className="gap-1">
            <TrendingUp className="h-3 w-3" /> Leading
          </Badge>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span
          className={cn(
            "score-display text-foreground",
            compact ? "text-5xl" : "text-6xl sm:text-7xl",
          )}
        >
          {score}
        </span>
        <span className="text-sm font-medium text-muted-foreground">pts</span>
      </div>

      {capped && (
        <div className="mt-3 flex items-start gap-2 rounded-md bg-warning/15 px-3 py-2 text-xs text-warning-foreground">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>Score capped at 990 — must lead a round to win.</span>
        </div>
      )}
      {winner && (
        <div className="mt-3 rounded-md bg-success/15 px-3 py-2 text-xs font-medium text-success-foreground">
          Winner — reached 1000 while leading.
        </div>
      )}
    </Card>
  );
}
