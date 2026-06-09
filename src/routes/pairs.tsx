import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { pairStats } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/pairs")({
  head: () => ({ meta: [{ title: "Pair Statistics — Tysiac Score" }] }),
  component: PairsPage,
});

function PairsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <h1 className="font-display text-3xl font-bold">Pair statistics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track how partnerships perform across matches.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pairStats.map((p) => (
            <Card key={p.id} className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">
                  {p.player1} + {p.player2}
                </h3>
                {p.games === 1 && (
                  <Badge variant="outline" className="text-[10px]">
                    New
                  </Badge>
                )}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Games</p>
                  <p className="font-display text-xl font-bold tabular-nums">{p.games}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Wins</p>
                  <p className="font-display text-xl font-bold tabular-nums text-success">
                    {p.wins}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Win %</p>
                  <p className="font-display text-xl font-bold tabular-nums">
                    {Math.round(p.winRate * 100)}%
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Average final</span>
                  <span className="font-semibold tabular-nums">{p.averageScore}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Highest win</span>
                  <span className="font-semibold tabular-nums">{p.highestWin}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Biggest loss</span>
                  <span className="font-semibold tabular-nums">{p.biggestLoss}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
