import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Undo2, Pencil } from "lucide-react";
import type { Round } from "@/lib/mock-data";

interface RoundHistoryItemProps {
  round: Round;
  onUndo?: () => void;
  onCorrect?: () => void;
}

export function RoundHistoryItem({ round, onUndo, onCorrect }: RoundHistoryItemProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary font-display text-sm font-bold">
            #{round.number}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                Led by Team {round.leadingTeam}
              </Badge>
              {round.isCorrection && (
                <Badge variant="secondary" className="text-[10px]">
                  Correction
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Entered by {round.enteredBy} · {format(new Date(round.timestamp), "MMM d, HH:mm")}
            </p>
          </div>
        </div>
        <div className="text-right tabular-nums">
          <div className="flex gap-4 text-sm">
            <span>
              <span className="text-muted-foreground">A </span>
              <span className="font-semibold">+{round.pointsA}</span>
            </span>
            <span>
              <span className="text-muted-foreground">B </span>
              <span className="font-semibold">+{round.pointsB}</span>
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {round.scoreAfterA} : {round.scoreAfterB}
          </p>
        </div>
      </div>
      {round.note && (
        <p className="mt-3 rounded-md bg-muted/50 px-3 py-2 text-xs italic text-muted-foreground">
          “{round.note}”
        </p>
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
