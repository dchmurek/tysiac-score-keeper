import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Undo2, Pencil } from "lucide-react";

interface RoundHistoryItemProps {
  round: {
    id: string;
    number: number;
    leadingTeam: "A" | "B";
    pointsA: number;
    pointsB: number;
    scoreAfterA: number;
    scoreAfterB: number;
    enteredBy: string;
    timestamp: string;
    note?: string;
    corrections?: Array<{
      id: string;
      oldPointsA: number;
      oldPointsB: number;
      newPointsA: number;
      newPointsB: number;
      reason?: string;
      enteredBy: string;
      timestamp: string;
    }>;
  };
  onUndo?: () => void;
  onCorrect?: () => void;
}

export function RoundHistoryItem({
  round,
  onUndo,
  onCorrect,
}: RoundHistoryItemProps) {
  const latestCorrection = round.corrections?.[round.corrections.length - 1];

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary font-display text-sm font-bold">
            #{round.number}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold">Round #{round.number}</p>

              <Badge variant="outline" className="text-[10px]">
                Led by Team {round.leadingTeam}
              </Badge>

              {round.corrections && round.corrections.length > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  Corrected {round.corrections.length}x
                </Badge>
              )}
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              Entered by {round.enteredBy} ·{" "}
              {format(new Date(round.timestamp), "MMM d, HH:mm")}
            </p>
          </div>
        </div>

        <div className="text-right tabular-nums">
          <div className="flex gap-4 text-sm">
            <span>
              <span className="text-muted-foreground">A </span>
              <span className="font-semibold">
                {round.pointsA >= 0 ? "+" : ""}
                {round.pointsA}
              </span>
            </span>

            <span>
              <span className="text-muted-foreground">B </span>
              <span className="font-semibold">
                {round.pointsB >= 0 ? "+" : ""}
                {round.pointsB}
              </span>
            </span>
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            Score after: {round.scoreAfterA} : {round.scoreAfterB}
          </p>
        </div>
      </div>

      {round.note && (
        <p className="mt-3 rounded-md bg-muted/50 px-3 py-2 text-xs italic text-muted-foreground">
          “{round.note}”
        </p>
      )}

      {latestCorrection && (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <p className="font-medium">Last correction</p>

          <p className="mt-1 tabular-nums">
            A: {latestCorrection.oldPointsA} → {latestCorrection.newPointsA} ·
            B: {latestCorrection.oldPointsB} → {latestCorrection.newPointsB}
          </p>

          {latestCorrection.reason && (
            <p className="mt-1 italic">“{latestCorrection.reason}”</p>
          )}

          <p className="mt-1 text-[11px] opacity-80">
            Corrected by {latestCorrection.enteredBy}
          </p>
        </div>
      )}

      {(onUndo || onCorrect) && (
        <div className="mt-3 flex justify-end gap-2">
          {onCorrect && (
            <Button size="sm" variant="outline" onClick={onCorrect}>
              <Pencil className="h-3.5 w-3.5" /> Correct
            </Button>
          )}

          {onUndo && (
            <Button size="sm" variant="outline" onClick={onUndo}>
              <Undo2 className="h-3.5 w-3.5" /> Undo
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}