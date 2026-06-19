import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PlayerBadge } from "@/components/player-badge";
import { Check, Plus, Shuffle, RotateCw, Users, X } from "lucide-react";
import { users } from "@/lib/mock-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/create-room")({
  head: () => ({ meta: [{ title: "Create Room — Tysiac Score" }] }),
  component: CreateRoom,
});

interface DraftPlayer {
  id: string;
  name: string;
  isGuest: boolean;
  isHost?: boolean;
  canScore: boolean;
  team?: "A" | "B";
}

function getDefaultRoomName() {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function CreateRoom() {
  const navigate = useNavigate();

  const createRoom = useMutation(api.rooms.createRoom);
  const startRoom = useMutation(api.rooms.startRoom);

  const [isCreating, setIsCreating] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const [createdRoom, setCreatedRoom] = useState<{
    roomId: string;
    code: string;
    hostParticipantId?: string;
  } | null>(null);

  const [allowSpectators, setAllowSpectators] = useState(true);
  const [mode, setMode] = useState<"local" | "online">("local");

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [name] = useState(getDefaultRoomName);
  const [hostName, setHostName] = useState("");
  const [target] = useState(1000);

  const [players, setPlayers] = useState<DraftPlayer[]>([
    {
      id: "local-host",
      name: hostName,
      isGuest: false,
      isHost: true,
      canScore: true,
      team: "A",
    },
  ]);

  const [search, setSearch] = useState("");
  const [guestName, setGuestName] = useState("");

  const filteredUsers = users
    .filter((u) => u.username.toLowerCase().includes(search.toLowerCase()))
    .filter((u) => !players.some((p) => p.id === u.id));

  const addUser = (u: (typeof users)[number]) => {
    setPlayers([
      ...players,
      {
        id: u.id,
        name: u.username,
        isGuest: false,
        canScore: false,
      },
    ]);
  };

  const addGuest = () => {
    const trimmedGuestName = guestName.trim();

    if (!trimmedGuestName) {
      toast.error("Enter guest nickname.");
      return;
    }

    if (
      players.some(
        (player) => player.name.toLowerCase() === trimmedGuestName.toLowerCase(),
      )
    ) {
      toast.error("A player with this nickname is already added.");
      return;
    }

    setPlayers([
      ...players,
      {
        id: `g-${Date.now()}`,
        name: trimmedGuestName,
        isGuest: true,
        canScore: false,
      },
    ]);

    setGuestName("");
  };

  const remove = (id: string) => {
    const player = players.find((p) => p.id === id);

    if (player?.isHost) {
      toast.error("Host cannot be removed.");
      return;
    }

    setPlayers(players.filter((p) => p.id !== id));
  };

  const setTeam = (id: string, team: "A" | "B" | undefined) => {
    const teamCount = players.filter((p) => p.team === team).length;

    if (team && teamCount >= 2) {
      toast.error(`Team ${team} already has two players.`);
      return;
    }

    setPlayers(players.map((p) => (p.id === id ? { ...p, team } : p)));
  };

  const toggleScore = (id: string) => {
    setPlayers(
      players.map((p) => (p.id === id ? { ...p, canScore: !p.canScore } : p)),
    );
  };

  const randomize = () => {
    if (players.length !== 4) {
      toast.error("Add exactly four players before randomizing teams.");
      return;
    }

    const shuffled = [...players].sort(() => Math.random() - 0.5);

    setPlayers(
      shuffled.map((p, i) => ({
        ...p,
        team: i < 2 ? "A" : "B",
      })),
    );
  };

  const rotate = () => {
    setPlayers(
      players.map((p) => ({
        ...p,
        team: p.team === "A" ? "B" : p.team === "B" ? "A" : undefined,
      })),
    );
  };

  const handleNextStep = async () => {
    if (step !== 1) {
      setStep((currentStep) => (currentStep + 1) as typeof step);
      return;
    }

    if (!hostName.trim()) {
      toast.error("Enter your nickname.");
      return;
    }

    try {
      setIsCreating(true);

      const room = await createRoom({
        name: name.trim(),
        hostName: hostName.trim(),
        allowSpectators: mode === "online" ? allowSpectators : false,
        mode,
      });

      if (room.hostParticipantId) {
        sessionStorage.setItem(
          `tysiac-participant-${room.code}`,
          room.hostParticipantId,
        );
      }

      toast.success(
        mode === "online"
          ? `Online room created. Code: ${room.code}`
          : "Local match created.",
      );

      if (mode === "online") {
        navigate({
          to: "/room/$roomId",
          params: {
            roomId: room.code,
          },
        });

        return;
      }

      setCreatedRoom(room);
      setStep(2);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error ? error.message : "Could not create the room.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartMatch = async () => {
    if (!createdRoom) {
      toast.error("Create the room first.");
      return;
    }

    if (players.length !== 4) {
      toast.error("Exactly four players are required.");
      return;
    }

    const teamA = players.filter((player) => player.team === "A");
    const teamB = players.filter((player) => player.team === "B");

    if (teamA.length !== 2 || teamB.length !== 2) {
      toast.error("Each team must contain exactly two players.");
      return;
    }

    try {
      setIsStarting(true);

      await startRoom({
        code: createdRoom.code,
        players: players.map((player) => ({
          nickname: player.name,
          participantType: player.isGuest ? "guest" : "account",
          team: player.team as "A" | "B",
          canEnterScores: player.canScore,
          isHost: Boolean(player.isHost),
        })),
      });

      if (createdRoom.hostParticipantId) {
        sessionStorage.setItem(
          `tysiac-participant-${createdRoom.code}`,
          createdRoom.hostParticipantId,
        );
      }

      toast.success("Room ready — let's play!");

      navigate({
        to: "/room/$roomId",
        params: {
          roomId: createdRoom.code,
        },
      });
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error ? error.message : "Could not start the match.",
      );
    } finally {
      setIsStarting(false);
    }
  };

  const stepLabels = ["Details", "Players", "Teams", "Start"] as const;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <h1 className="font-display text-3xl font-bold">Create room</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set up a new Tysiąc match.
        </p>

        <div className="mt-6">
          <div className="grid grid-cols-4 items-start">
            {stepLabels.map((label, index) => {
              const stepNumber = (index + 1) as 1 | 2 | 3 | 4;
              const isDone = step > stepNumber;
              const isActive = step >= stepNumber;

              return (
                <div key={label} className="relative flex flex-col items-center">
                  {index < stepLabels.length - 1 && (
                    <div
                      className={cn(
                        "absolute left-1/2 top-4 h-px w-full",
                        isDone ? "bg-primary" : "bg-border",
                      )}
                    />
                  )}

                  <div
                    className={cn(
                      "relative z-10 grid h-8 w-8 place-items-center rounded-full text-sm font-bold",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {isDone ? <Check className="h-4 w-4" /> : stepNumber}
                  </div>

                  <span className="mt-2 text-center text-xs text-muted-foreground">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <Card className="mt-6 p-6">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-display text-lg font-bold">Game setup</h2>

              <div>
                <Label htmlFor="hostName">Your nickname</Label>
                <Input
                  id="hostName"
                  className="mt-2 h-11"
                  value={hostName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setHostName(value);

                    setPlayers((currentPlayers) =>
                      currentPlayers.map((player) =>
                        player.isHost ? { ...player, name: value } : player,
                      ),
                    );
                  }}
                  placeholder="e.g. Adam"
                />
              </div>

              <div className="space-y-3">
                <Label>Game mode</Label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setMode("local")}
                    className={cn(
                      "rounded-xl border p-4 text-left transition",
                      mode === "local"
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:bg-secondary",
                    )}
                  >
                    <div className="font-semibold">Local game</div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      One device tracks the match. Add players manually and
                      start right away.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("online")}
                    className={cn(
                      "rounded-xl border p-4 text-left transition",
                      mode === "online"
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:bg-secondary",
                    )}
                  >
                    <div className="font-semibold">Online room</div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Share a room code. Players join from their phones before
                      the match starts.
                    </p>
                  </button>
                </div>
              </div>

              {mode === "online" && (
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-semibold">Allow spectators</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Spectators can join the room and watch the score.
                    </p>
                  </div>

                  <Switch
                    checked={allowSpectators}
                    onCheckedChange={setAllowSpectators}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="target">Target Score</Label>
                <Input
                  id="target"
                  type="number"
                  inputMode="numeric"
                  className="mt-2 h-11 tabular-nums"
                  value={target}
                  readOnly
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Default 1000. First team to reach this while leading wins.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-lg font-bold">Add local players</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add players manually. This local match will be tracked from one device.
                </p>
              </div>

              <div>
                <Label>Add player</Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    placeholder="Player nickname"
                    className="h-11"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        addGuest();
                      }
                    }}
                  />

                  <Button onClick={addGuest}>
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  You need exactly four players to start a match.
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold">Players ({players.length}/4)</p>

                <div className="mt-2 space-y-2">
                  {players.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border border-border p-2.5"
                    >
                      <PlayerBadge name={p.name} isGuest={p.isGuest} />

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => remove(p.id)}
                        disabled={Boolean(p.isHost)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {players.length < 4 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Add {4 - players.length} more player{4 - players.length === 1 ? "" : "s"}.
                  </p>
                )}

                {players.length > 4 && (
                  <p className="mt-2 text-xs text-destructive">
                    Too many players. Tysiąc match needs exactly four players.
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">
                  Configure teams
                </h2>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={randomize}>
                    <Shuffle className="h-3.5 w-3.5" /> Randomize
                  </Button>

                  <Button variant="outline" size="sm" onClick={rotate}>
                    <RotateCw className="h-3.5 w-3.5" /> Rotate
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {(["A", "B"] as const).map((t) => (
                  <Card key={t} className="p-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          background:
                            t === "A" ? "var(--team-a)" : "var(--team-b)",
                        }}
                      />

                      <p className="font-display font-bold">Team {t}</p>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      {players
                        .filter((p) => p.team === t)
                        .map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between rounded-md bg-secondary p-2"
                          >
                            <PlayerBadge
                              name={p.name}
                              isGuest={p.isGuest}
                              size="sm"
                            />

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setTeam(p.id, undefined)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}

                      {players.filter((p) => p.team === t).length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          No players yet.
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              <div>
                <p className="text-sm font-semibold">
                  <Users className="mr-1 inline h-3.5 w-3.5" /> Unassigned
                </p>

                <div className="mt-2 space-y-1.5">
                  {players
                    .filter((p) => !p.team)
                    .map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between rounded-md border border-border p-2"
                      >
                        <PlayerBadge
                          name={p.name}
                          isGuest={p.isGuest}
                          size="sm"
                        />

                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setTeam(p.id, "A")}
                            disabled={
                              players.filter((player) => player.team === "A")
                                .length >= 2
                            }
                          >
                            → A
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setTeam(p.id, "B")}
                            disabled={
                              players.filter((player) => player.team === "B")
                                .length >= 2
                            }
                          >
                            → B
                          </Button>
                        </div>
                      </div>
                    ))}

                  {players.filter((p) => !p.team).length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Everyone is assigned.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-lg font-bold">Ready to start</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Check teams before starting the local match.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {(["A", "B"] as const).map((team) => (
                  <Card key={team} className="p-4">
                    <p className="font-display font-bold">Team {team}</p>

                    <div className="mt-3 space-y-2">
                      {players
                        .filter((player) => player.team === team)
                        .map((player) => (
                          <PlayerBadge
                            key={player.id}
                            name={player.name}
                            isGuest={player.isGuest}
                            size="sm"
                          />
                        ))}
                    </div>
                  </Card>
                ))}
              </div>

              <p className="rounded-lg bg-secondary p-3 text-sm text-muted-foreground">
                This is a local game. Scores will be entered from this device.
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={() => setStep((s) => (s - 1) as typeof step)}
              >
                Back
              </Button>
            ) : (
              <Link to="/">
                <Button variant="ghost">Cancel</Button>
              </Link>
            )}

            {step < 4 ? (
              <Button onClick={handleNextStep} disabled={isCreating}>
                {isCreating
                  ? "Creating..."
                  : step === 1 && mode === "online"
                    ? "Create online room"
                    : step === 1
                      ? "Continue local setup"
                      : step === 2
                        ? "Continue"
                        : "Review teams"}
              </Button>
            ) : (
              <Button
                onClick={handleStartMatch}
                disabled={isStarting || !createdRoom}
              >
                {isStarting ? "Starting..." : "Start Match"}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}