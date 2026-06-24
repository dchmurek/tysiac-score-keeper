import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
  useParams,
  useRouterState,
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
import { QRCodeSVG } from "qrcode.react";
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
import { RoomCodeCard } from "@/components/room-code-card";

export const Route = createFileRoute("/room/$roomId")({
  head: () => ({ meta: [{ title: "Game Room — Tysiac Score" }] }),
  component: GameRoom,
});

function GameRoom() {
  const { roomId } = useParams({ from: "/room/$roomId" });
  const navigate = useNavigate();

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  if (pathname.endsWith("/large-screen")) {
    return <Outlet />;
  }

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
  const assignParticipantToTeam = useMutation(api.rooms.assignParticipantToTeam);
  const removeParticipantFromRoom = useMutation(api.rooms.removeParticipantFromRoom);
  const startRoom = useMutation(api.rooms.startRoom);
  const randomizeRoomTeams = useMutation(api.rooms.randomizeRoomTeams);
  const clearRoomTeams = useMutation(api.rooms.clearRoomTeams);

  const [showAdd, setShowAdd] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const [showFinish, setShowFinish] = useState(false);
  const [showUndoConfirm, setShowUndoConfirm] = useState(false);
  const [correctingRound, setCorrectingRound] = useState<any | null>(null);
  const [isPausing, setIsPausing] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [isStartingRoom, setIsStartingRoom] = useState(false);
  const [isRandomizingTeams, setIsRandomizingTeams] = useState(false);
  const [isClearingTeams, setIsClearingTeams] = useState(false);

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

  const storedParticipantId =
    typeof window !== "undefined"
      ? sessionStorage.getItem(`tysiac-participant-${room.code}`)
      : null;

  const currentParticipant = storedParticipantId
    ? room.participants.find(
      (participant) => participant.id === storedParticipantId,
    )
    : null;

  const isLocalRoom = room.mode === "local";

  const canManageRoom =
    isLocalRoom ||
    !storedParticipantId ||
    !currentParticipant ||
    currentParticipant.role === "host" ||
    currentParticipant.role === "player";

  const isHost =
    isLocalRoom ||
    !storedParticipantId ||
    !currentParticipant ||
    currentParticipant.role === "host";

  const leading =
    room.teamA.score > room.teamB.score ? "A" : room.teamB.score > room.teamA.score ? "B" : null;
  const lastRound = room.rounds[room.rounds.length - 1];

  const joinUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?code=${room.code}`
      : "";

  const roundsPlayed = room.rounds.length;

  const totalPointsA = room.rounds.reduce(
    (sum, round) => sum + round.pointsA,
    0,
  );

  const totalPointsB = room.rounds.reduce(
    (sum, round) => sum + round.pointsB,
    0,
  );

  const highestRoundA =
    room.rounds.length > 0
      ? Math.max(...room.rounds.map((round) => round.pointsA))
      : 0;

  const highestRoundB =
    room.rounds.length > 0
      ? Math.max(...room.rounds.map((round) => round.pointsB))
      : 0;

  const averageRoundA =
    roundsPlayed > 0 ? Math.round(totalPointsA / roundsPlayed) : 0;

  const averageRoundB =
    roundsPlayed > 0 ? Math.round(totalPointsB / roundsPlayed) : 0;

  const winner =
    room.winner ??
    (room.teamA.score > room.teamB.score
      ? "A"
      : room.teamB.score > room.teamA.score
        ? "B"
        : null);

  const handleLeaveLobby = async () => {
    const storedParticipantId = sessionStorage.getItem(
      `tysiac-participant-${room.code}`,
    );

    if (isHost) {
      try {
        setIsDiscarding(true);

        await discardRoom({
          code: room.code,
        });

        sessionStorage.removeItem(`tysiac-participant-${room.code}`);

        toast.success("Room closed.");

        navigate({ to: "/" });
      } catch (error) {
        console.error(error);

        toast.error(
          error instanceof Error
            ? error.message
            : "Could not close the room.",
        );
      } finally {
        setIsDiscarding(false);
      }

      return;
    }

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

  const handleAssignParticipant = async (
    participantId: any,
    team?: "A" | "B",
  ) => {
    try {
      await assignParticipantToTeam({
        code: room.code,
        participantId,
        team,
      });

      toast.success(
        team ? `Player assigned to Team ${team}.` : "Player unassigned.",
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not assign player.",
      );
    }
  };

  const handleRemoveParticipant = async (participantId: any) => {
    try {
      await removeParticipantFromRoom({
        code: room.code,
        participantId,
      });

      toast.success("Player removed from the room.");
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not remove player.",
      );
    }
  };

  const handleRandomizeOnlineTeams = async () => {
    try {
      setIsRandomizingTeams(true);

      await randomizeRoomTeams({
        code: room.code,
      });

      toast.success("Teams randomized.");
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not randomize teams.",
      );
    } finally {
      setIsRandomizingTeams(false);
    }
  };

  const handleClearOnlineTeams = async () => {
    try {
      setIsClearingTeams(true);

      await clearRoomTeams({
        code: room.code,
      });

      toast.success("Teams cleared.");
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not clear teams.",
      );
    } finally {
      setIsClearingTeams(false);
    }
  };

  const handleStartOnlineMatch = async () => {
    if (teamAPlayers.length !== 2 || teamBPlayers.length !== 2) {
      toast.error("Each team must contain exactly two players.");
      return;
    }

    const playingParticipants = [...teamAPlayers, ...teamBPlayers];

    try {
      setIsStartingRoom(true);

      await startRoom({
        code: room.code,
        players: playingParticipants.map((participant) => ({
          nickname: participant.name,
          participantType: participant.participantType,
          team: participant.team as "A" | "B",
          canEnterScores:
            participant.role === "host" || participant.canEnterScores,
          isHost: participant.role === "host",
        })),
      });

      toast.success("Match started.");
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not start the match.",
      );
    } finally {
      setIsStartingRoom(false);
    }
  };

  const teamAPlayers = room.participants.filter(
    (participant) => participant.team === "A",
  );

  const teamBPlayers = room.participants.filter(
    (participant) => participant.team === "B",
  );

  const unassignedPlayers = room.participants.filter(
    (participant) =>
      participant.role !== "spectator" &&
      participant.team !== "A" &&
      participant.team !== "B",
  );

  const spectators = room.participants.filter(
    (participant) => participant.role === "spectator",
  );

  const canStartMatch =
    teamAPlayers.length === 2 && teamBPlayers.length === 2;

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
                  Share the room code with players before starting the match.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-stretch">
              <RoomCodeCard code={room.code} />

              <Card className="grid place-items-center p-4">
                <div className="text-center">
                  <div className="inline-block rounded-xl border border-border bg-white p-3">
                    <QRCodeSVG value={joinUrl} size={128} />
                  </div>

                  <p className="mt-3 text-sm font-medium">
                    Scan to join
                  </p>

                  <p className="mt-1 font-mono text-sm font-bold tracking-widest text-primary">
                    {room.code}
                  </p>
                </div>
              </Card>
            </div>
          </Card>

          <Card className="mt-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold">
                  Lobby
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Assign players to teams before starting the match.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isHost && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRandomizeOnlineTeams}
                      disabled={isRandomizingTeams}
                    >
                      {isRandomizingTeams ? "Randomizing..." : "Randomize"}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleClearOnlineTeams}
                      disabled={isClearingTeams}
                    >
                      {isClearingTeams ? "Clearing..." : "Clear"}
                    </Button>
                  </>
                )}

                <Badge variant={canStartMatch ? "default" : "secondary"}>
                  {teamAPlayers.length}/2 Team A · {teamBPlayers.length}/2 Team B
                </Badge>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold">Unassigned</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Players waiting for a team
                </p>

                <div className="mt-4 space-y-3">
                  {unassignedPlayers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No unassigned players.
                    </p>
                  ) : (
                    unassignedPlayers.map((participant) => (
                      <div
                        key={participant.id}
                        className="rounded-lg border border-border p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{participant.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {participant.role} · {participant.participantType}
                            </p>
                          </div>

                          {isHost && participant.role !== "host" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleRemoveParticipant(participant.id)
                              }
                            >
                              Remove
                            </Button>
                          )}
                        </div>

                        {isHost && (
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={teamAPlayers.length >= 2}
                              onClick={() =>
                                handleAssignParticipant(participant.id, "A")
                              }
                            >
                              Team A
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              disabled={teamBPlayers.length >= 2}
                              onClick={() =>
                                handleAssignParticipant(participant.id, "B")
                              }
                            >
                              Team B
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold">Team A</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Needs exactly 2 players
                </p>

                <div className="mt-4 space-y-3">
                  {teamAPlayers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No players yet.
                    </p>
                  ) : (
                    teamAPlayers.map((participant) => (
                      <div
                        key={participant.id}
                        className="rounded-lg border border-border p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{participant.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {participant.role} · {participant.participantType}
                            </p>
                          </div>

                          {isHost && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleAssignParticipant(participant.id, undefined)
                              }
                            >
                              Unassign
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold">Team B</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Needs exactly 2 players
                </p>

                <div className="mt-4 space-y-3">
                  {teamBPlayers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No players yet.
                    </p>
                  ) : (
                    teamBPlayers.map((participant) => (
                      <div
                        key={participant.id}
                        className="rounded-lg border border-border p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{participant.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {participant.role} · {participant.participantType}
                            </p>
                          </div>

                          {isHost && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleAssignParticipant(participant.id, undefined)
                              }
                            >
                              Unassign
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {spectators.length > 0 && (
              <div className="mt-5 rounded-xl border border-border bg-secondary/40 p-4">
                <h3 className="font-semibold">Spectators</h3>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {spectators.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                    >
                      <div>
                        <p className="font-medium">{participant.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {participant.participantType}
                        </p>
                      </div>

                      {isHost && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveParticipant(participant.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card className="mt-4 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-lg font-bold">
                  Ready to start?
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Assign exactly two players to each team before starting the match.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={handleLeaveLobby}
                  disabled={isDiscarding}
                >
                  {isHost
                    ? isDiscarding
                      ? "Closing..."
                      : "Close room"
                    : "Back to home"}
                </Button>

                {isHost && (
                  <Button
                    onClick={handleStartOnlineMatch}
                    disabled={!canStartMatch || isStartingRoom}
                  >
                    {isStartingRoom ? "Starting..." : "Start Match"}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </AppShell>
    );
  }

  const handleUndoLastRound = async () => {
    try {
      setIsUndoing(true);

      await undoLastRound({
        code: room.code,
        enteredBy: storedParticipantId ?? "",
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

      toast.success("Game ended.");

      navigate({
        to: "/",
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
            {!isLocalRoom && (
              <>
                <div className="hidden items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5 sm:flex">
                  <span className="text-xs text-muted-foreground">Code</span>
                  <span className="font-mono text-sm font-bold tracking-wider">
                    {room.code}
                  </span>

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
                      <div className="rounded-xl border border-border bg-white p-4">
                        <QRCodeSVG value={joinUrl} size={192} />
                      </div>

                      <p className="mt-4 font-mono text-3xl font-bold tracking-widest">
                        {room.code}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Scan to join
                      </p>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            )}

            <Link to="/room/$roomId/large-screen" params={{ roomId }}>
              <Button size="icon" variant="outline" aria-label="Large screen mode">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </Link>

            {canManageRoom && (
              <Button
                size="icon"
                variant="outline"
                aria-label="Pause"
                onClick={() => setShowPause(true)}
              >
                <Pause className="h-4 w-4" />
              </Button>
            )}
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
            {room.status === "finished" ? (
              <Card className="p-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  GAME FINISHED
                </p>

                <p className="mt-3 text-lg font-bold">
                  {room.winner ? `Team ${room.winner} won` : "Game ended"}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Final score: {room.teamA.score} : {room.teamB.score}
                </p>

                <Button
                  variant="ghost"
                  className="mt-4 w-full"
                  onClick={handleDiscardRoom}
                  disabled={isDiscarding}
                >
                  {isDiscarding ? "Leaving..." : "Back to Home"}
                </Button>
              </Card>
            ) : canManageRoom ? (
              <Card className="p-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  NEXT ACTION
                </p>

                <Button
                  className="mt-4 h-12 w-full"
                  disabled={room.status !== "active"}
                  onClick={() => setShowAdd(true)}
                >
                  + Add Round
                </Button>

                <Button
                  variant="outline"
                  className="mt-3 w-full"
                  disabled={room.rounds.length === 0 || isUndoing}
                  onClick={() => setShowUndoConfirm(true)}
                >
                  {isUndoing ? "Undoing..." : "Undo Last Round"}
                </Button>

                <Button
                  variant="ghost"
                  className="mt-3 w-full"
                  onClick={() => setShowFinish(true)}
                >
                  End Game
                </Button>
              </Card>
            ) : (
              <Card className="p-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  SPECTATOR MODE
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  You are watching this game. Score controls are hidden.
                </p>
              </Card>
            )}

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
                  {lastRound.pointsB} → {lastRound.scoreAfterA} :{" "}
                  {lastRound.scoreAfterB}
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
                      canManageRoom &&
                        room.status === "active" &&
                        r.number === room.rounds.length
                        ? () => setShowUndoConfirm(true)
                        : undefined
                    }
                    onCorrect={
                      canManageRoom && room.status === "active"
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
            enteredBy: storedParticipantId ?? "",
          });
        }}
      />

      {/* Pause modal */}
      {/* Pause modal */}
      <Dialog open={showPause} onOpenChange={setShowPause}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {room.status === "paused" ? "Resume this game?" : "Pause this game?"}
            </DialogTitle>

            <DialogDescription>
              {room.status === "paused"
                ? "The game will continue and players will be able to enter rounds again."
                : "The game will be paused. You can resume it later from this room."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPause(false)}
              disabled={isPausing}
            >
              Cancel
            </Button>

            <Button
              variant="outline"
              onClick={async () => {
                await handlePauseToggle();
                setShowPause(false);
              }}
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

      <Dialog open={showUndoConfirm} onOpenChange={setShowUndoConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Undo last round?</DialogTitle>
            <DialogDescription>
              This will remove the last round and restore the previous score.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUndoConfirm(false)}
              disabled={isUndoing}
            >
              Keep Round
            </Button>

            <Button
              variant="destructive"
              onClick={async () => {
                setShowUndoConfirm(false);
                await handleUndoLastRound();
              }}
              disabled={isUndoing}
            >
              <Undo2 className="h-4 w-4" />
              {isUndoing ? "Undoing..." : "Undo Round"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showFinish} onOpenChange={setShowFinish}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End this game?</DialogTitle>
            <DialogDescription>
              This will end the current game and return you to the main screen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinish(false)}>
              Keep Playing
            </Button>

            <Button
              variant="destructive"
              onClick={handleDiscardRoom}
              disabled={isDiscarding}
            >
              <X className="h-4 w-4" />
              {isDiscarding ? "Ending..." : "End Game"}
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
              enteredBy: storedParticipantId ?? "",
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