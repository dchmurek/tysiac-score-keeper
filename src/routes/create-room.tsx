import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { RoomCodeCard } from "@/components/room-code-card";
import { PlayerBadge } from "@/components/player-badge";
import { Check, Plus, Shuffle, RotateCw, Users, Search, X } from "lucide-react";
import { users } from "@/lib/mock-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/create-room")({
  head: () => ({ meta: [{ title: "Create Room — Tysiac Score" }] }),
  component: CreateRoom,
});

interface DraftPlayer {
  id: string;
  name: string;
  isGuest: boolean;
  canScore: boolean;
  team?: "A" | "B";
}

function CreateRoom() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState("Saturday Match");
  const [target, setTarget] = useState(1000);
  const [players, setPlayers] = useState<DraftPlayer[]>([
    { id: "u-adam", name: "Adam", isGuest: false, canScore: true, team: "A" },
  ]);
  const [search, setSearch] = useState("");
  const [guestName, setGuestName] = useState("");

  const filteredUsers = users
    .filter((u) => u.username.toLowerCase().includes(search.toLowerCase()))
    .filter((u) => !players.some((p) => p.id === u.id));

  const addUser = (u: typeof users[number]) =>
    setPlayers([...players, { id: u.id, name: u.username, isGuest: false, canScore: false }]);
  const addGuest = () => {
    if (!guestName.trim()) return;
    setPlayers([...players, { id: `g-${Date.now()}`, name: guestName.trim(), isGuest: true, canScore: false }]);
    setGuestName("");
  };
  const remove = (id: string) => setPlayers(players.filter((p) => p.id !== id));
  const setTeam = (id: string, team: "A" | "B" | undefined) =>
    setPlayers(players.map((p) => (p.id === id ? { ...p, team } : p)));
  const toggleScore = (id: string) =>
    setPlayers(players.map((p) => (p.id === id ? { ...p, canScore: !p.canScore } : p)));

  const randomize = () => {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    setPlayers(shuffled.map((p, i) => ({ ...p, team: i < shuffled.length / 2 ? "A" : "B" })));
  };
  const rotate = () =>
    setPlayers(players.map((p) => ({ ...p, team: p.team === "A" ? "B" : p.team === "B" ? "A" : undefined })));

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <h1 className="font-display text-3xl font-bold">Create room</h1>
        <p className="mt-1 text-sm text-muted-foreground">Set up a new match in four quick steps.</p>

        <div className="mt-6 flex items-center gap-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold",
                  step >= n ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
                )}
              >
                {step > n ? <Check className="h-4 w-4" /> : n}
              </div>
              {n < 4 && <div className={cn("h-px flex-1", step > n ? "bg-primary" : "bg-border")} />}
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>Details</span>
          <span>Players</span>
          <span>Teams</span>
          <span>Permissions</span>
        </div>

        <Card className="mt-6 p-6">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-display text-lg font-bold">Room details</h2>
              <div>
                <Label htmlFor="rname">Room Name</Label>
                <Input id="rname" className="mt-2 h-11" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="target">Target Score</Label>
                <Input id="target" type="number" inputMode="numeric" className="mt-2 h-11 tabular-nums" value={target} onChange={(e) => setTarget(Number(e.target.value))} />
                <p className="mt-1 text-xs text-muted-foreground">Default 1000. First team to reach this while leading wins.</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-display text-lg font-bold">Add players</h2>

              <div>
                <Label className="flex items-center gap-2"><Search className="h-3.5 w-3.5" /> Registered player</Label>
                <Input className="mt-2 h-11" placeholder="Search username..." value={search} onChange={(e) => setSearch(e.target.value)} />
                {search && (
                  <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-border">
                    {filteredUsers.length === 0 && <p className="p-3 text-sm text-muted-foreground">No results.</p>}
                    {filteredUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => { addUser(u); setSearch(""); }}
                        className="flex w-full items-center justify-between border-b border-border p-3 text-left last:border-0 hover:bg-secondary"
                      >
                        <PlayerBadge name={u.username} />
                        <Plus className="h-4 w-4 text-primary" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Add guest</Label>
                <div className="mt-2 flex gap-2">
                  <Input placeholder="Guest nickname" className="h-11" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
                  <Button onClick={addGuest}><Plus className="h-4 w-4" /> Add</Button>
                </div>
              </div>

              <RoomCodeCard code="K8P2" />

              <div>
                <p className="text-sm font-semibold">Players ({players.length})</p>
                <div className="mt-2 space-y-2">
                  {players.map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-2.5">
                      <PlayerBadge name={p.name} isGuest={p.isGuest} />
                      <Button size="icon" variant="ghost" onClick={() => remove(p.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">Configure teams</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={randomize}><Shuffle className="h-3.5 w-3.5" /> Randomize</Button>
                  <Button variant="outline" size="sm" onClick={rotate}><RotateCw className="h-3.5 w-3.5" /> Rotate</Button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {(["A", "B"] as const).map((t) => (
                  <Card key={t} className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: t === "A" ? "var(--team-a)" : "var(--team-b)" }} />
                      <p className="font-display font-bold">Team {t}</p>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      {players.filter((p) => p.team === t).map((p) => (
                        <div key={p.id} className="flex items-center justify-between rounded-md bg-secondary p-2">
                          <PlayerBadge name={p.name} isGuest={p.isGuest} size="sm" />
                          <Button size="sm" variant="ghost" onClick={() => setTeam(p.id, undefined)}>Remove</Button>
                        </div>
                      ))}
                      {players.filter((p) => p.team === t).length === 0 && (
                        <p className="text-xs text-muted-foreground">No players yet.</p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold"><Users className="mr-1 inline h-3.5 w-3.5" /> Unassigned</p>
                <div className="mt-2 space-y-1.5">
                  {players.filter((p) => !p.team).map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-md border border-border p-2">
                      <PlayerBadge name={p.name} isGuest={p.isGuest} size="sm" />
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => setTeam(p.id, "A")}>→ A</Button>
                        <Button size="sm" variant="outline" onClick={() => setTeam(p.id, "B")}>→ B</Button>
                      </div>
                    </div>
                  ))}
                  {players.filter((p) => !p.team).length === 0 && (
                    <p className="text-xs text-muted-foreground">Everyone is assigned.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-lg font-bold">Score permissions</h2>
                <p className="mt-1 text-sm text-muted-foreground">By default only the host can enter scores. Grant access to selected players.</p>
              </div>
              <div className="space-y-2">
                {players.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <PlayerBadge name={p.name} isGuest={p.isGuest} />
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">Can enter scores</span>
                      <Switch checked={p.canScore} onCheckedChange={() => toggleScore(p.id)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep((s) => (s - 1) as typeof step)}>Back</Button>
            ) : (
              <Link to="/dashboard"><Button variant="ghost">Cancel</Button></Link>
            )}
            {step < 4 ? (
              <Button onClick={() => setStep((s) => (s + 1) as typeof step)}>
                {step === 1 ? "Create Room" : step === 2 ? "Continue" : "Confirm Teams"}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  toast.success("Room ready — let's play!");
                  navigate({ to: "/room/$roomId", params: { roomId: "r-active" } });
                }}
              >
                Start Match
              </Button>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
