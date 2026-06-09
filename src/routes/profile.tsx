import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatsCard } from "@/components/stats-card";
import { currentUser, playerStats, recentMatches } from "@/lib/mock-data";
import { format } from "date-fns";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Tysiac Score" }] }),
  component: Profile,
});

function Profile() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <Card className="flex flex-wrap items-start justify-between gap-4 p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
                {currentUser.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-display text-2xl font-bold">{currentUser.username}</h1>
              <p className="text-sm text-muted-foreground">
                Joined {format(new Date(currentUser.joinedAt), "MMMM yyyy")}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/settings">
              <Button variant="outline">
                <Pencil className="h-4 w-4" /> Edit Profile
              </Button>
            </Link>
          </div>
        </Card>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatsCard label="Games" value={playerStats.games} />
          <StatsCard label="Wins" value={playerStats.wins} />
          <StatsCard label="Losses" value={playerStats.losses} />
          <StatsCard
            label="Win rate"
            value={`${Math.round(playerStats.winRate * 100)}%`}
            emphasis
          />
          <StatsCard label="Total pts" value={playerStats.totalPoints.toLocaleString()} />
          <StatsCard label="Avg final" value={playerStats.averageScore} />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Most frequent partner
            </p>
            <p className="mt-1 font-display text-xl font-bold">{playerStats.mostFrequentPartner}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Best partner
            </p>
            <p className="mt-1 font-display text-xl font-bold">{playerStats.bestPartner}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Frequent opponent
            </p>
            <p className="mt-1 font-display text-xl font-bold">
              {playerStats.mostFrequentOpponent}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Highest final
            </p>
            <p className="mt-1 font-display text-xl font-bold text-success">
              {playerStats.highestScore}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Lowest final
            </p>
            <p className="mt-1 font-display text-xl font-bold">{playerStats.lowestScore}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Current form
            </p>
            <div className="mt-2 flex gap-1">
              {playerStats.recentForm.map((r, i) => (
                <span
                  key={i}
                  className={cn(
                    "grid h-6 w-6 place-items-center rounded text-[11px] font-bold",
                    r === "W"
                      ? "bg-success/15 text-success-foreground"
                      : "bg-destructive/15 text-destructive-foreground",
                  )}
                >
                  {r}
                </span>
              ))}
            </div>
          </Card>
        </div>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Recent matches</h2>
            <Link to="/history" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <Card className="mt-3 overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_1fr_70px_80px] items-center gap-3 border-b border-border bg-muted/40 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Date</span>
              <span>Partner</span>
              <span>Opponents</span>
              <span className="text-right">Result</span>
              <span></span>
            </div>
            {recentMatches.map((m) => {
              const youOnA = m.teamA.players.includes(currentUser.username);
              const partner = youOnA
                ? m.teamA.players.find((p) => p !== currentUser.username)
                : m.teamB.players.find((p) => p !== currentUser.username);
              const opps = youOnA ? m.teamB.players : m.teamA.players;
              const won = (youOnA && m.winner === "A") || (!youOnA && m.winner === "B");
              const myScore = youOnA ? m.teamA.score : m.teamB.score;
              const theirScore = youOnA ? m.teamB.score : m.teamA.score;
              return (
                <div
                  key={m.id}
                  className="grid grid-cols-[1fr_1fr_1fr_70px_80px] items-center gap-3 border-b border-border px-4 py-3 text-sm last:border-0"
                >
                  <span className="text-muted-foreground">{format(new Date(m.date), "MMM d")}</span>
                  <span className="font-medium">{partner ?? "—"}</span>
                  <span className="text-muted-foreground">{opps.join(" + ")}</span>
                  <span className="text-right tabular-nums">
                    {myScore}-{theirScore}
                  </span>
                  <span className="text-right">
                    <Badge
                      className={
                        won
                          ? "bg-success text-success-foreground"
                          : "bg-destructive/15 text-destructive-foreground"
                      }
                    >
                      {won ? "Win" : "Loss"}
                    </Badge>
                  </span>
                </div>
              );
            })}
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
