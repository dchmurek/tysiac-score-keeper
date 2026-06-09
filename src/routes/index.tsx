import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, LogIn, QrCode, Smartphone, BarChart3, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tysiac Score — Track your Tysiąc games with ease" },
      {
        name: "description",
        content:
          "Create a room, invite friends, track every round, and compare statistics for your Tysiąc card games.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [code, setCode] = useState("");
  const [nick, setNick] = useState("");
  const [role, setRole] = useState<"player" | "spectator">("player");

  return (
    <div className="min-h-screen felt-gradient">
      <AppHeader variant="marketing" />

      <section className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 sm:pt-16">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Built for real card-table
              play
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Track your Tysiąc games <span className="text-primary">with ease</span>.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Create a room, invite your friends, track every round and compare statistics — built
              for use while you play with physical cards.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/create-room">
                <Button size="lg" className="h-12 px-6 text-base">
                  <Plus className="h-5 w-5" /> Create Room
                </Button>
              </Link>
              <a href="#join">
                <Button size="lg" variant="outline" className="h-12 px-6 text-base">
                  <LogIn className="h-5 w-5" /> Join Room
                </Button>
              </a>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: Smartphone,
                  title: "Play with physical cards",
                  desc: "The app only tracks scores — the game stays at the table.",
                },
                {
                  icon: BarChart3,
                  title: "Track scores live",
                  desc: "Every round, leader and correction is saved.",
                },
                {
                  icon: QrCode,
                  title: "Join with a code or QR",
                  desc: "Spectators and players hop in instantly.",
                },
                {
                  icon: Users,
                  title: "Personal & pair stats",
                  desc: "See your best partners and win streaks.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-3"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card id="join" className="p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-xl font-bold">Join a room</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the room code your host shared with you.
            </p>
            <form
              className="mt-5 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success(`Joining room ${code || "—"} as ${nick || "Guest"} (${role})`);
              }}
            >
              <div>
                <Label htmlFor="code">Room Code</Label>
                <Input
                  id="code"
                  placeholder="K8P2"
                  className="mt-2 h-12 text-center font-mono text-2xl uppercase tracking-[0.4em]"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                />
              </div>
              <div>
                <Label htmlFor="nick">Nickname</Label>
                <Input
                  id="nick"
                  placeholder="Your name at the table"
                  className="mt-2 h-11"
                  value={nick}
                  onChange={(e) => setNick(e.target.value)}
                />
              </div>
              <div>
                <Label>Join as</Label>
                <RadioGroup
                  value={role}
                  onValueChange={(v) => setRole(v as "player" | "spectator")}
                  className="mt-2 grid grid-cols-2 gap-2"
                >
                  {(["player", "spectator"] as const).map((r) => (
                    <Label
                      key={r}
                      htmlFor={`role-${r}`}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background p-3 text-sm capitalize has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                    >
                      <RadioGroupItem value={r} id={`role-${r}`} />
                      {r}
                    </Label>
                  ))}
                </RadioGroup>
              </div>
              <Button type="submit" className="h-12 w-full text-base">
                Join Room
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Need an account?{" "}
                <Link to="/sign-up" className="font-medium text-primary hover:underline">
                  Create one
                </Link>{" "}
                ·{" "}
                <Link to="/sign-in" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </Card>
        </div>
      </section>
    </div>
  );
}
