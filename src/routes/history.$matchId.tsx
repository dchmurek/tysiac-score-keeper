import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMatchById, activeRoom } from "@/lib/mock-data";
import { PlayerBadge } from "@/components/player-badge";
import { RoundHistoryItem } from "@/components/round-history-item";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/history/$matchId")({
  head: () => ({ meta: [{ title: "Match Details — Tysiac Score" }] }),
  component: MatchDetails,
});

function MatchDetails() {
  const { matchId } = useParams({ from: "/history/$matchId" });
  const match = getMatchById(matchId);

  if (!match) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl px-4 py-10 text-center sm:px-6">
          <p className="text-muted-foreground">Match not found.</p>
          <Link to="/history" className="mt-4 inline-block text-primary hover:underline">Back to history</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <Link to="/history" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All matches
        </Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">{match.roomName}</h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(match.date), "MMMM d, yyyy")} · {match.rounds} rounds · {match.durationMinutes} min
            </p>
          </div>
          <Badge className="bg-success text-success-foreground">Team {match.winner} won</Badge>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {([
            { id: "A" as const, players: match.teamA.players, score: match.teamA.score },
            { id: "B" as const, players: match.teamB.players, score: match.teamB.score },
          ]).map((t) => (
            <Card key={t.id} className={`p-5 ${match.winner === t.id ? "border-success" : ""}`}>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.id === "A" ? "var(--team-a)" : "var(--team-b)" }} />
                <p className="font-display font-bold">Team {t.id}</p>
              </div>
              <p className="score-display mt-3 text-5xl">{t.score}</p>
              <div className="mt-3 space-y-1.5">
                {t.players.map((p) => <PlayerBadge key={p} name={p} size="sm" status="confirmed" />)}
              </div>
            </Card>
          ))}
        </div>

        <section className="mt-8">
          <h2 className="font-display text-lg font-bold">Round history</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {activeRoom.rounds.map((r) => <RoundHistoryItem key={r.id} round={r} />)}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-lg font-bold">Player assignments</h2>
          <Card className="mt-3 divide-y divide-border">
            <div className="flex items-center justify-between p-3"><PlayerBadge name="Adam" status="confirmed" /><Badge variant="secondary">Registered</Badge></div>
            <div className="flex items-center justify-between p-3"><PlayerBadge name="Kuba" status="confirmed" /><Badge variant="secondary">Registered</Badge></div>
            <div className="flex items-center justify-between p-3"><PlayerBadge name="Bary" isGuest /><Badge variant="outline">Guest</Badge></div>
            <div className="flex items-center justify-between p-3"><PlayerBadge name="Michał" status="pending" /><Badge variant="outline">Manually added</Badge></div>
          </Card>
        </section>

        <div className="mt-8 flex justify-end">
          <Button variant="outline">Export match</Button>
        </div>
      </div>
    </AppShell>
  );
}
