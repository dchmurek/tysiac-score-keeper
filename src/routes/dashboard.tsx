import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { StatsCard } from "@/components/stats-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, LogIn, PlayCircle, ChevronRight, Check, X } from "lucide-react";
import {
  recentMatches,
  pendingConfirmations,
  playerStats,
  pausedRoom,
  currentUser,
} from "@/lib/mock-data";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Tysiac Score" }] }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <h1 className="font-display text-3xl font-bold">{currentUser.username}</h1>
          </div>
          <Link to="/create-room">
            <Button size="lg" className="h-11">
              <Plus className="h-4.5 w-4.5" /> New Room
            </Button>
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/create-room">
            <Card className="group flex h-full cursor-pointer items-start gap-3 p-4 transition-colors hover:border-primary">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Create New Room</p>
                <p className="text-xs text-muted-foreground">Start a new match</p>
              </div>
            </Card>
          </Link>
          <Link to="/">
            <Card className="flex h-full cursor-pointer items-start gap-3 p-4 transition-colors hover:border-primary">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary">
                <LogIn className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Join Room</p>
                <p className="text-xs text-muted-foreground">Enter a room code</p>
              </div>
            </Card>
          </Link>
          <Link to="/room/r-paused">
            <Card className="flex h-full cursor-pointer items-start gap-3 p-4 transition-colors hover:border-primary">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-warning/20 text-warning-foreground">
                <PlayCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Continue Paused</p>
                <p className="text-xs text-muted-foreground">{pausedRoom.name}</p>
              </div>
            </Card>
          </Link>
          <Card className="flex h-full items-start gap-3 p-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">
                Pending{" "}
                {pendingConfirmations.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {pendingConfirmations.length}
                  </Badge>
                )}
              </p>
              <p className="text-xs text-muted-foreground">Match confirmations</p>
            </div>
          </Card>
        </div>

        <section className="mt-8">
          <h2 className="font-display text-lg font-bold">Your stats</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatsCard label="Games" value={playerStats.games} />
            <StatsCard label="Wins" value={playerStats.wins} />
            <StatsCard label="Losses" value={playerStats.losses} />
            <StatsCard
              label="Win rate"
              value={`${Math.round(playerStats.winRate * 100)}%`}
              emphasis
            />
          </div>
        </section>

        {pendingConfirmations.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-lg font-bold">Pending confirmations</h2>
            <div className="mt-3 space-y-2">
              {pendingConfirmations.map((pc) => (
                <Card
                  key={pc.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{pc.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(pc.date), "MMMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => toast.success("Rejected")}>
                      <X className="h-3.5 w-3.5" /> Reject
                    </Button>
                    <Button size="sm" onClick={() => toast.success("Accepted")}>
                      <Check className="h-3.5 w-3.5" /> Accept
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Recent matches</h2>
            <Link to="/history" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {recentMatches.slice(0, 4).map((m) => (
              <Card key={m.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{m.roomName}</p>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {m.status}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {format(new Date(m.date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 tabular-nums">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{m.teamA.players.join(" + ")}</p>
                      <p className={`font-bold ${m.winner === "A" ? "text-success" : ""}`}>
                        {m.teamA.score}
                      </p>
                    </div>
                    <span className="text-muted-foreground">vs</span>
                    <div>
                      <p className="text-xs text-muted-foreground">{m.teamB.players.join(" + ")}</p>
                      <p className={`font-bold ${m.winner === "B" ? "text-success" : ""}`}>
                        {m.teamB.score}
                      </p>
                    </div>
                    <Link to="/history/$matchId" params={{ matchId: m.id }}>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
