import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { recentMatches } from "@/lib/mock-data";
import { format } from "date-fns";
import { Search, Filter } from "lucide-react";

export const Route = createFileRoute("/history/")({
  head: () => ({ meta: [{ title: "Match History — Tysiac Score" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const [q, setQ] = useState("");
  const [winner, setWinner] = useState<string>("all");

  const matches = recentMatches.filter((m) => {
    const text = [m.roomName, ...m.teamA.players, ...m.teamB.players].join(" ").toLowerCase();
    if (q && !text.includes(q.toLowerCase())) return false;
    if (winner !== "all" && m.winner !== winner) return false;
    return true;
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <h1 className="font-display text-3xl font-bold">Match history</h1>
        <p className="mt-1 text-sm text-muted-foreground">Browse and filter every match you've played.</p>

        <Card className="mt-6 p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by player, pair, room..." className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <Select value={winner} onValueChange={setWinner}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any winner</SelectItem>
                <SelectItem value="A">Team A won</SelectItem>
                <SelectItem value="B">Team B won</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline"><Filter className="h-4 w-4" /> More filters</Button>
          </div>
        </Card>

        <div className="mt-4 grid gap-3">
          {matches.map((m) => (
            <Card key={m.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{m.roomName}</p>
                    <Badge variant="outline" className="text-[10px] capitalize">{m.status}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {format(new Date(m.date), "MMM d, yyyy")} · {m.rounds} rounds · {m.durationMinutes} min
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 tabular-nums">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{m.teamA.players.join(" + ")}</p>
                    <p className={`font-bold ${m.winner === "A" ? "text-success" : ""}`}>{m.teamA.score}</p>
                  </div>
                  <span className="text-muted-foreground">vs</span>
                  <div>
                    <p className="text-xs text-muted-foreground">{m.teamB.players.join(" + ")}</p>
                    <p className={`font-bold ${m.winner === "B" ? "text-success" : ""}`}>{m.teamB.score}</p>
                  </div>
                  <Link to="/history/$matchId" params={{ matchId: m.id }}>
                    <Button size="sm">View Details</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
          {matches.length === 0 && (
            <Card className="p-8 text-center text-sm text-muted-foreground">No matches match your filters.</Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
