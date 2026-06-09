import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AlertTriangle, Crown, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface AddRoundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentA: number;
  currentB: number;
  targetScore?: number;
}

type Lead = "A" | "B" | null;

export function AddRoundModal({
  open,
  onOpenChange,
  currentA,
  currentB,
  targetScore = 1000,
}: AddRoundModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [lead, setLead] = useState<Lead>(null);
  const [ptsA, setPtsA] = useState("");
  const [ptsB, setPtsB] = useState("");
  const [note, setNote] = useState("");

  const reset = () => {
    setStep(1);
    setLead(null);
    setPtsA("");
    setPtsB("");
    setNote("");
  };

  const numA = Number(ptsA) || 0;
  const numB = Number(ptsB) || 0;

  const applyRule = (current: number, added: number, didLead: boolean) => {
    const raw = current + added;
    if (raw >= targetScore) {
      if (didLead) return { final: targetScore, capped: false, won: true };
      return { final: 990, capped: true, won: false };
    }
    return { final: raw, capped: false, won: false };
  };

  const resultA = applyRule(currentA, numA, lead === "A");
  const resultB = applyRule(currentB, numB, lead === "B");

  const handleSave = () => {
    if (!lead) return;
    toast.success(`Round saved — Team A ${resultA.final} / Team B ${resultB.final}`);
    if (resultA.won || resultB.won) {
      toast.success(`Team ${resultA.won ? "A" : "B"} wins! Match ended.`);
    }
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Round</DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Which team led the round?"
              : "Enter the points each team scored this round."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="grid grid-cols-2 gap-3">
            {(["A", "B"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setLead(t)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border-2 p-6 text-left transition-all",
                  lead === t
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/40",
                )}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: t === "A" ? "var(--team-a)" : "var(--team-b)" }}
                />
                <span className="font-display text-2xl font-bold">Team {t}</span>
                <span className="text-xs text-muted-foreground">Tap to select</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ptsA">
                  Team A points {lead === "A" && <span className="text-primary">(led)</span>}
                </Label>
                <Input
                  id="ptsA"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="mt-2 h-14 text-center text-2xl font-bold tabular-nums"
                  value={ptsA}
                  onChange={(e) => setPtsA(e.target.value.replace(/\D/g, ""))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="ptsB">
                  Team B points {lead === "B" && <span className="text-primary">(led)</span>}
                </Label>
                <Input
                  id="ptsB"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="mt-2 h-14 text-center text-2xl font-bold tabular-nums"
                  value={ptsB}
                  onChange={(e) => setPtsB(e.target.value.replace(/\D/g, ""))}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="note">Note (optional)</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Strong hand, called bombka..."
                className="mt-2 resize-none"
                rows={2}
              />
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Result preview
              </p>
              <div className="mt-3 space-y-2">
                {(["A", "B"] as const).map((t) => {
                  const cur = t === "A" ? currentA : currentB;
                  const add = t === "A" ? numA : numB;
                  const res = t === "A" ? resultA : resultB;
                  return (
                    <div key={t} className="flex items-center justify-between text-sm tabular-nums">
                      <span className="font-medium">Team {t}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-muted-foreground">{cur}</span>
                        <span className="text-muted-foreground">+ {add}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                        <span
                          className={cn(
                            "font-bold",
                            res.won && "text-success",
                            res.capped && "text-warning-foreground",
                          )}
                        >
                          {res.final}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {(resultA.won || resultB.won) && (
                <div className="mt-3 flex items-start gap-2 rounded-md bg-success/15 px-3 py-2 text-xs text-success-foreground">
                  <Crown className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Team {resultA.won ? "A" : "B"} reached {targetScore} points while leading. The
                    match will end.
                  </span>
                </div>
              )}
              {(resultA.capped || resultB.capped) && (
                <div className="mt-3 flex items-start gap-2 rounded-md bg-warning/20 px-3 py-2 text-xs text-warning-foreground">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Team {resultA.capped ? "A" : "B"} would exceed {targetScore} points, but they
                    did not lead the round. Their score will be capped at 990.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 1 ? (
            <Button onClick={() => setStep(2)} disabled={!lead} className="w-full sm:w-auto">
              Next
            </Button>
          ) : (
            <div className="flex w-full gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSave} className="flex-1">
                Save Round
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
