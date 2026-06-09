import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { X, QrCode } from "lucide-react";
import { activeRoom } from "@/lib/mock-data";

export const Route = createFileRoute("/room/$roomId/large-screen")({
  head: () => ({ meta: [{ title: "Large Screen — Tysiac Score" }] }),
  component: LargeScreen,
});

function LargeScreen() {
  const { roomId } = useParams({ from: "/room/$roomId/large-screen" });
  const room = activeRoom;
  const last = room.rounds[room.rounds.length - 1];

  return (
    <div className="flex min-h-screen flex-col bg-background felt-gradient">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{room.name}</p>
          <p className="font-mono text-lg font-bold tracking-widest text-primary">{room.code}</p>
        </div>
        <Link to="/room/$roomId" params={{ roomId }}>
          <Button variant="ghost"><X className="h-4 w-4" /> Exit</Button>
        </Link>
      </div>

      <div className="flex flex-1 items-center px-4 py-6 sm:px-12">
        <div className="grid w-full gap-6 lg:grid-cols-2">
          {([room.teamA, room.teamB] as const).map((t, i) => (
            <div key={t.id} className="rounded-2xl border-2 border-border bg-card p-8 text-center">
              <div className="mb-2 flex items-center justify-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: i === 0 ? "var(--team-a)" : "var(--team-b)" }} />
                <p className="text-2xl font-bold uppercase tracking-wider text-muted-foreground">{t.name}</p>
              </div>
              <p className="text-xl text-muted-foreground">{t.players.map((p) => p.name).join(" + ")}</p>
              <p className="score-display mt-6 text-[18vw] text-foreground sm:text-[14vw] lg:text-[10vw]">{t.score}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-4">
        <div className="text-sm">
          <p className="text-muted-foreground">Round <span className="font-bold text-foreground">{room.rounds.length + 1}</span> · Dealer <span className="font-bold text-foreground">{room.currentDealer}</span></p>
          {last && <p className="text-xs text-muted-foreground">Last: Team {last.leadingTeam} led, +{last.pointsA}/{last.pointsB}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="grid h-16 w-16 place-items-center rounded-lg border border-border bg-card">
            <QrCode className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}
