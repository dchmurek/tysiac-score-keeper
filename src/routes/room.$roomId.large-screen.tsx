import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/room/$roomId/large-screen")({
  head: () => ({ meta: [{ title: "Large Screen — Tysiac Score" }] }),
  component: LargeScreen,
});

function LargeScreen() {
  const { roomId } = useParams({ from: "/room/$roomId/large-screen" });

  const room = useQuery(api.rooms.getGameRoom, {
    code: roomId,
  });

  if (room === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background felt-gradient px-4">
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground">Loading room...</p>
        </Card>
      </div>
    );
  }

  if (room === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background felt-gradient px-4">
        <Card className="max-w-md p-6 text-center">
          <h1 className="font-display text-xl font-bold">Room not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Check the room code and try again.
          </p>
          <Link to="/" className="mt-4 inline-flex">
            <Button>Back home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const last = room.rounds[room.rounds.length - 1];
  const joinUrl = `${window.location.origin}/?code=${room.code}`;

  return (
    <div className="flex min-h-screen flex-col bg-background felt-gradient">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {room.name}
          </p>
          <p className="font-mono text-lg font-bold tracking-widest text-primary">{room.code}</p>
        </div>
        <Link to="/room/$roomId" params={{ roomId }}>
          <Button variant="ghost">
            <X className="h-4 w-4" /> Exit
          </Button>
        </Link>
      </div>

      <div className="flex flex-1 items-center px-4 py-6 sm:px-12">
        <div className="grid w-full gap-6 lg:grid-cols-2">
          {([room.teamA, room.teamB] as const).map((t, i) => (
            <div key={t.id} className="rounded-2xl border-2 border-border bg-card p-8 text-center">
              <div className="mb-2 flex items-center justify-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: i === 0 ? "var(--team-a)" : "var(--team-b)" }}
                />
                <p className="text-2xl font-bold uppercase tracking-wider text-muted-foreground">
                  {t.name}
                </p>
              </div>
              <p className="text-xl text-muted-foreground">
                {t.players.map((p) => p.name).join(" + ")}
              </p>
              <p className="score-display mt-6 text-[18vw] text-foreground sm:text-[14vw] lg:text-[10vw]">
                {t.score}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-4">
        <div className="text-sm">
          <p className="text-muted-foreground">
            Round <span className="font-bold text-foreground">{room.rounds.length + 1}</span> ·
            Dealer <span className="font-bold text-foreground">{room.currentDealer}</span>
          </p>
          {last && (
            <p className="text-xs text-muted-foreground">
              Last: Team {last.leadingTeam} declared, +{last.pointsA}/{last.pointsB}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-border bg-white p-2">
            <QRCodeSVG value={joinUrl} size={56} />
          </div>
        </div>
      </div>
    </div>
  );
}
