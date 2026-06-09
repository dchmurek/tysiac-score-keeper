import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { playerRanking, pairStats } from "@/lib/mock-data";
import { Trophy, Medal, Award } from "lucide-react";

export const Route = createFileRoute("/rankings")({
  head: () => ({ meta: [{ title: "Rankings — Tysiac Score" }] }),
  component: Rankings,
});

type Sort = "wins" | "winRate" | "games" | "average";

function rankIcon(rank: number) {
  if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
  if (rank === 3) return <Award className="h-4 w-4 text-amber-700" />;
  return null;
}

function Rankings() {
  const [sort, setSort] = useState<Sort>("winRate");

  const sortedPlayers = [...playerRanking]
    .sort((a, b) => {
      if (sort === "wins") return b.wins - a.wins;
      if (sort === "games") return b.games - a.games;
      if (sort === "average") return b.averageScore - a.averageScore;
      return b.winRate - a.winRate;
    })
    .map((p, i) => ({ ...p, rank: i + 1 }));

  const sortedPairs = [...pairStats]
    .sort((a, b) => b.winRate - a.winRate)
    .map((p, i) => ({ ...p, rank: i + 1 }));

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <h1 className="font-display text-3xl font-bold">Rankings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          No minimum games required — every player and pair counts.
        </p>

        <Tabs defaultValue="players" className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <TabsList>
              <TabsTrigger value="players">Players</TabsTrigger>
              <TabsTrigger value="pairs">Pairs</TabsTrigger>
            </TabsList>
            <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="winRate">Highest win rate</SelectItem>
                <SelectItem value="wins">Most wins</SelectItem>
                <SelectItem value="games">Most games</SelectItem>
                <SelectItem value="average">Best average score</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="players" className="mt-4">
            <Card className="overflow-hidden">
              <div className="grid grid-cols-[40px_1fr_60px_60px_60px_70px_80px] items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <span>#</span>
                <span>Player</span>
                <span className="text-right">G</span>
                <span className="text-right">W</span>
                <span className="text-right">L</span>
                <span className="text-right">Win %</span>
                <span className="text-right">Avg</span>
              </div>
              {sortedPlayers.map((p) => (
                <div
                  key={p.username}
                  className="grid grid-cols-[40px_1fr_60px_60px_60px_70px_80px] items-center gap-2 border-b border-border px-4 py-3 text-sm last:border-0 tabular-nums"
                >
                  <span className="flex items-center gap-1 font-bold">
                    {p.rank} {rankIcon(p.rank)}
                  </span>
                  <span className="font-medium">{p.username}</span>
                  <span className="text-right">{p.games}</span>
                  <span className="text-right font-semibold text-success">{p.wins}</span>
                  <span className="text-right text-muted-foreground">{p.losses}</span>
                  <span className="text-right font-bold">{Math.round(p.winRate * 100)}%</span>
                  <span className="text-right">{p.averageScore}</span>
                </div>
              ))}
            </Card>
          </TabsContent>

          <TabsContent value="pairs" className="mt-4">
            <Card className="overflow-hidden">
              <div className="grid grid-cols-[40px_1fr_60px_60px_60px_70px] items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <span>#</span>
                <span>Pair</span>
                <span className="text-right">G</span>
                <span className="text-right">W</span>
                <span className="text-right">L</span>
                <span className="text-right">Win %</span>
              </div>
              {sortedPairs.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-[40px_1fr_60px_60px_60px_70px] items-center gap-2 border-b border-border px-4 py-3 text-sm last:border-0 tabular-nums"
                >
                  <span className="flex items-center gap-1 font-bold">
                    {p.rank} {rankIcon(p.rank)}
                  </span>
                  <span className="font-medium">
                    {p.player1} <span className="text-muted-foreground">+</span> {p.player2}{" "}
                    {p.games === 1 && (
                      <Badge variant="outline" className="ml-1 text-[10px]">
                        New
                      </Badge>
                    )}
                  </span>
                  <span className="text-right">{p.games}</span>
                  <span className="text-right font-semibold text-success">{p.wins}</span>
                  <span className="text-right text-muted-foreground">{p.losses}</span>
                  <span className="text-right font-bold">{Math.round(p.winRate * 100)}%</span>
                </div>
              ))}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
