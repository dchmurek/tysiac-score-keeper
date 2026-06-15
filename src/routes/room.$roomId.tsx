import {
  createFileRoute,
  Link,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TeamCard } from "@/components/team-card";
import { RoundHistoryItem } from "@/components/round-history-item";
import { AddRoundModal } from "@/components/add-round-modal";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Plus,
  Undo2,
  Pencil,
  Pause,
  X,
  Maximize2,
  QrCode,
  Copy,
  ChevronDown,
  History,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/room/$roomId")({
  head: () => ({ meta: [{ title: "Game Room — Tysiac Score" }] }),
  component: GameRoom,
});

function GameRoom() {
  const { roomId } = useParams({ from: "/room/$roomId" });
  const navigate = useNavigate();

  const room = useQuery(api.rooms.getGameRoom, {
    code: roomId,
  });

  const addRound = useMutation(api.rooms.addRound);
  const pauseRoom = useMutation(api.rooms.pauseRoom);
  const resumeRoom = useMutation(api.rooms.resumeRoom);
  const undoLastRound = useMutation(api.rooms.undoLastRound);
  const discardRoom = useMutation(api.rooms.discardRoom);
  const correctRound = useMutation(api.rooms.correctRound);
  const leaveRoom = useMutation(api.rooms.leaveRoom);

  const [showAdd, setShowAdd] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const [showFinish, setShowFinish] = useState(false);
  const [correctingRound, setCorrectingRound] = useState<any | null>(null);
  const [isPausing, setIsPausing] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);

  if (room === undefined) {
    return (
      <AppShell>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <Card className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Loading room...
            </p>
          </Card>
        </div>
      </AppShell>
    );
  }

  if (room === null) {
    return (
      <AppShell>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <Card className="p-6 text-center">
            <h1 className="font-display text-xl font-bold">
              Room not found
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Check the room code and try again.
            </p>
          </Card>
        </div>
      </AppShell>
    );
  }

  const leading =
    room.teamA.score > room.teamB.score ? "A" : room.teamB.score > room.teamA.score ? "B" : null;
  const lastRound = room.rounds[room.rounds.length - 1];

  const handleLeaveLobby = async () => {
    const storedParticipantId = sessionStorage.getItem(
      `tysiac-participant-${room.code}`,
    );

    if (!storedParticipantId) {
      navigate({ to: "/" });
      return;
    }

    try {
      await leaveRoom({
        code: room.code,
        participantId: storedParticipantId as any,
      });

      sessionStorage.removeItem(`tysiac-participant-${room.code}`);

      toast.success("You left the room.");

      navigate({ to: "/" });
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not leave the room.",
      );
    }
  };

  if (room.status === "waiting") {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <Card className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl font-bold">
                    {room.name}
                  </h1>
                  <Badge variant="secondary">Waiting</Badge>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  Players can join with the room code before the host starts the match.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-secondary px-4 py-2">
                <p className="text-xs text-muted-foreground">Room code</p>
                <p className="font-mono text-2xl font-bold tracking-widest">
                  {room.code}
                </p>
              </div>
            </div>
          </Card>

          <Card className="mt-4 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold">
                  Participants
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {room.participants.length} joined
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {room.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{participant.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {participant.participantType === "guest"
                          ? "Guest"
                          : "Account"}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        variant={
                          participant.role === "host"
                            ? "default"
                            : "secondary"
                        }
                        className="capitalize"
                      >
                        {participant.role}
                      </Badge>

                      {participant.canEnterScores && (
                        <span className="text-[11px] text-muted-foreground">
                          Can enter scores
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="mt-4 p-5 text-center">
            <h2 className="font-display text-lg font-bold">
              Waiting for the host
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The match will start when the host assigns teams and starts the game.
            </p>

            <Button
              variant="outline"
              className="mt-4"
              onClick={handleLeaveLobby}
            >
              Back to home
            </Button>
          </Card>
        </div>
      </AppShell>
    );
  }

  const handleUndoLastRound = async () => {
    const confirmed = window.confirm(
      "Undo the last round? This action will restore the previous score.",
    );

    if (!confirmed) return;

    try {
      setIsUndoing(true);

      await undoLastRound({
        code: room.code,
      });

      toast.success("Last round undone.");
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not undo the last round.",
      );
    } finally {
      setIsUndoing(false);
    }
  };

  const handlePauseToggle = async () => {
    try {
      setIsPausing(true);

      if (room.status === "paused") {
        await resumeRoom({
          code: room.code,
        });

        toast.success("Game resumed.");
        return;
      }

      const confirmed = window.confirm(
        "Pause this game? It can be resumed later.",
      );

      if (!confirmed) return;

      await pauseRoom({
        code: room.code,
      });

      toast.success("Game paused.");
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update the game status.",
      );
    } finally {
      setIsPausing(false);
    }
  };

  const handleDiscardRoom = async () => {
    try {
      setIsDiscarding(true);

      await discardRoom({
        code: room.code,
      });

      toast.success("Match discarded.");

      navigate({
        to: "/dashboard",
      });
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not discard the match.",
      );
    } finally {
      setIsDiscarding(false);
      setShowFinish(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
        {/* Top bar */}
        <Card className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-lg font-bold sm:text-xl">{room.name}</h1>
              <Badge
                variant={room.status === "paused" ? "secondary" : "default"}
                className="capitalize"
              >
                {room.status}
              </Badge>
            </div>
            <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
              <span>Round {room.rounds.length + 1}</span>
              <span>·</span>
              <span>Dealer: {room.currentDealer}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="hidden items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5 sm:flex">
              <span className="text-xs text-muted-foreground">Code</span>
              <span className="font-mono text-sm font-bold tracking-wider">{room.code}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => {
                  navigator.clipboard?.writeText(room.code);
                  toast.success("Copied");
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" aria-label="QR code">
                  <QrCode className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Room {room.code}</SheetTitle>
                </SheetHeader>
                <div className="mt-6 grid place-items-center">
                  <div className="grid h-56 w-56 place-items-center rounded-xl border-2 border-dashed border-border bg-muted/40">
                    <QrCode className="h-24 w-24 text-muted-foreground" />
                  </div>
                  <p className="mt-4 font-mono text-3xl font-bold tracking-widest">{room.code}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Scan to join</p>
                </div>
              </SheetContent>
            </Sheet>
            <Link to="/room/$roomId/large-screen" params={{ roomId }}>
              <Button size="icon" variant="outline" aria-label="Large screen mode">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="icon"
              variant="outline"
              aria-label="Pause"
              onClick={() => setShowPause(true)}
            >
              <Pause className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {room.status === "paused" && (
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            This game is paused. Resume it to enter another round.
          </div>
        )}

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px_1fr]">
          <TeamCard
            teamName={room.teamA.name}
            players={room.teamA.players.map((p) => p.name)}
            score={room.teamA.score}
            team="A"
            leading={leading === "A"}
          />

          {/* Center actions (lives between cards on desktop, below on mobile) */}
          <div className="order-3 flex flex-col gap-3 lg:order-none">
            <Card className="p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Next action
              </p>
              <Button
                size="lg"
                className="mt-3 h-16 w-full text-lg"
                onClick={() => setShowAdd(true)}
                disabled={room.status !== "active"}
              >
                <Plus className="h-6 w-6" /> Add Round
              </Button>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handleUndoLastRound}
                  disabled={
                    isUndoing ||
                    room.rounds.length === 0 ||
                    room.status !== "active"
                  }
                >
                  {isUndoing ? "Undoing..." : "Undo Last Round"}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full text-muted-foreground"
                onClick={() => setShowFinish(true)}
                disabled={room.status === "finished"}
              >
                Finish Without Saving
              </Button>
            </Card>

            {lastRound && (
              <Card className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Last round played
                </p>

                <div className="mt-2 flex items-center justify-between text-sm tabular-nums">
                  <span>
                    Round #{lastRound.number} — led by Team {lastRound.leadingTeam}
                  </span>
                </div>

                <div className="mt-1 text-xs text-muted-foreground">
                  Team A {lastRound.pointsA >= 0 ? "+" : ""}
                  {lastRound.pointsA} / Team B {lastRound.pointsB >= 0 ? "+" : ""}
                  {lastRound.pointsB} → {lastRound.scoreAfterA} : {lastRound.scoreAfterB}
                </div>

                {lastRound.corrections && lastRound.corrections.length > 0 && (
                  <div className="mt-2 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                    Corrected {lastRound.corrections.length}x
                  </div>
                )}

                {lastRound.note && (
                  <p className="mt-2 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                    {lastRound.note}
                  </p>
                )}
              </Card>
            )}
          </div>

          <TeamCard
            teamName={room.teamB.name}
            players={room.teamB.players.map((p) => p.name)}
            score={room.teamB.score}
            team="B"
            leading={leading === "B"}
          />
        </div>

        {/* Round history */}
        <section className="mt-6">
          <Collapsible defaultOpen>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <History className="h-4.5 w-4.5" /> Round history
              </h2>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  Toggle <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {[...room.rounds].reverse().map((r) => (
                  <RoundHistoryItem
                    key={r.id}
                    round={r}
                    onUndo={
                      room.status === "active" && r.number === room.rounds.length
                        ? handleUndoLastRound
                        : undefined
                    }
                    onCorrect={
                      room.status === "active"
                        ? () => setCorrectingRound(r)
                        : undefined
                    }
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </section>
      </div>

      <AddRoundModal
        open={showAdd}
        onOpenChange={setShowAdd}
        currentA={room.teamA.score}
        currentB={room.teamB.score}
        targetScore={room.targetScore}
        onSave={async (data) => {
          await addRound({
            code: room.code,
            leadingTeam: data.leadingTeam,
            pointsA: data.pointsA,
            pointsB: data.pointsB,
            note: data.note,
            enteredBy: "Adam",
          });
        }}
      />

      {/* Pause modal */}
      <Dialog open={showPause} onOpenChange={setShowPause}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pause this game?</DialogTitle>
            <DialogDescription>
              The game will be saved and can be resumed later. It will not count toward statistics
              until it is finished.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPause(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handlePauseToggle}
              disabled={isPausing || room.status === "finished"}
            >
              {isPausing
                ? "Saving..."
                : room.status === "paused"
                  ? "Resume Game"
                  : "Pause Game"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finish without saving */}
      <Dialog open={showFinish} onOpenChange={setShowFinish}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finish without saving?</DialogTitle>
            <DialogDescription>
              This match will be discarded and won't appear in stats.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinish(false)}>
              Keep playing
            </Button>
            <Button
              variant="destructive"
              onClick={handleDiscardRoom}
              disabled={isDiscarding}
            >
              <X className="h-4 w-4" />
              {isDiscarding ? "Discarding..." : "Discard"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {correctingRound && (
        <CorrectionDialog
          round={correctingRound}
          open={Boolean(correctingRound)}
          onOpenChange={(open) => {
            if (!open) {
              setCorrectingRound(null);
            }
          }}
          onSave={async ({ roundId, pointsA, pointsB, reason }) => {
            await correctRound({
              code: room.code,
              roundId,
              pointsA,
              pointsB,
              reason,
              enteredBy: "Adam",
            });
          }}
        />
      )}
    </AppShell>
  );
}

function CorrectionDialog({
  round,
  open,
  onOpenChange,
  onSave,
}: {
  round: {
    id: any;
    number: number;
    pointsA: number;
    pointsB: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    roundId: any;
    pointsA: number;
    pointsB: number;
    reason?: string;
  }) => Promise<void>;
}) {
  const [pointsA, setPointsA] = useState(String(round.pointsA));
  const [pointsB, setPointsB] = useState(String(round.pointsB));
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Correct Round #{round.number}</DialogTitle>
          <DialogDescription>
            Update the points for this round. All following rounds will be recalculated.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Team A points</label>
            <input
              className="mt-2 h-12 w-full rounded-md border border-input bg-background px-3 text-center text-xl font-bold tabular-nums"
              inputMode="text"
              value={pointsA}
              onChange={(event) => {
                if (/^-?\d*$/.test(event.target.value)) {
                  setPointsA(event.target.value);
                }
              }}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Team B points</label>
            <input
              className="mt-2 h-12 w-full rounded-md border border-input bg-background px-3 text-center text-xl font-bold tabular-nums"
              inputMode="text"
              value={pointsB}
              onChange={(event) => {
                if (/^-?\d*$/.test(event.target.value)) {
                  setPointsB(event.target.value);
                }
              }}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Reason (optional)</label>
            <input
              className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="e.g. forgotten meldunek"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button
            disabled={isSaving}
            onClick={async () => {
              const parsedA = Number(pointsA);
              const parsedB = Number(pointsB);

              if (!Number.isInteger(parsedA) || !Number.isInteger(parsedB)) {
                toast.error("Enter valid whole numbers for both teams.");
                return;
              }

              try {
                setIsSaving(true);

                await onSave({
                  roundId: round.id,
                  pointsA: parsedA,
                  pointsB: parsedB,
                  reason: reason.trim() || undefined,
                });

                toast.success("Round corrected.");
                onOpenChange(false);
              } catch (error) {
                console.error(error);

                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Could not save correction.",
                );
              } finally {
                setIsSaving(false);
              }
            }}
          >
            {isSaving ? "Saving..." : "Save correction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}