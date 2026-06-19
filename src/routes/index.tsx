import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, QrCode, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tysiac Score — score keeper for Tysiąc" },
      {
        name: "description",
        content:
          "Create a local Tysiąc game or join an online room with a code.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [code, setCode] = useState("");
  const [nick, setNick] = useState("");
  const [role, setRole] = useState<"player" | "spectator">("player");
  const navigate = useNavigate();
  const joinRoomAsGuest = useMutation(api.rooms.joinRoomAsGuest);
  const [isJoining, setIsJoining] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const enterFromBottom = shouldReduceMotion
    ? {}
    : {
      initial: { opacity: 0, y: 18 },
      animate: { opacity: 1, y: 0 },
    };

  const softScale = shouldReduceMotion
    ? {}
    : {
      initial: { opacity: 0, scale: 0.96 },
      animate: { opacity: 1, scale: 1 },
    };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get("code");

    if (codeFromUrl) {
      setCode(codeFromUrl.toUpperCase());

      setTimeout(() => {
        document.getElementById("join")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, []);

  const handleJoinRoom = async () => {
    if (!code.trim()) {
      toast.error("Enter a room code.");
      return;
    }

    if (!nick.trim()) {
      toast.error("Enter your nickname.");
      return;
    }

    try {
      setIsJoining(true);

      const result = await joinRoomAsGuest({
        code: code.trim().toUpperCase(),
        nickname: nick.trim(),
        role,
      });

      sessionStorage.setItem(
        `tysiac-participant-${result.roomCode}`,
        String(result.participantId),
      );

      toast.success(
        result.role === "player"
          ? "Joined the room as player."
          : "Joined the room as spectator.",
      );

      navigate({
        to: "/room/$roomId",
        params: {
          roomId: result.roomCode,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to join room";

      if (
        role === "player" &&
        message.toLowerCase().includes("before the game starts")
      ) {
        setRole("spectator");
        toast.error(
          "Game already started. You can still join as a spectator. Click Join Room again.",
        );
        return;
      }

      toast.error(message);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen felt-gradient">
      <AppHeader variant="marketing" />

      <section className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 sm:pt-16">
        <div className="grid items-stretch gap-10 lg:grid-cols-2">
          <motion.div
            className="flex flex-col"
            {...enterFromBottom}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <motion.span
              className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
              {...enterFromBottom}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
            >
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-primary"
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                      scale: [1, 1.35, 1],
                      opacity: [1, 0.65, 1],
                    }
                }
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              Built for real card-table play
            </motion.span>

            <motion.h1
              className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
              {...enterFromBottom}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.12 }}
            >
              Track your Tysiąc games{" "}
              <span className="text-primary">with ease</span>.
            </motion.h1>

            <motion.p
              className="mt-5 max-w-xl text-lg text-muted-foreground"
              {...enterFromBottom}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
            >
              Create a local game or join an online room with a code. Track
              every round while you play with physical cards.
            </motion.p>

            <motion.div
              className="mt-7 flex flex-wrap gap-3"
              {...enterFromBottom}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.28 }}
            >
              <Link to="/create-room">
                <motion.div
                  whileHover={shouldReduceMotion ? {} : { y: -3 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                >
                  <Button size="lg" className="h-12 px-6 text-base">
                    <Plus className="h-5 w-5" /> Create Game
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:mt-auto">
              {[
                {
                  icon: Smartphone,
                  title: "Play with physical cards",
                  desc: "The app only tracks scores — the game stays at the table.",
                },
                {
                  icon: QrCode,
                  title: "Join with a code or QR",
                  desc: "Online players can join by room code or QR.",
                },
              ].map(({ icon: Icon, title, desc }, index) => (
                <motion.div
                  key={title}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-3"
                  {...softScale}
                  transition={{
                    duration: 0.25,
                    ease: "easeOut",
                    delay: 0.35 + index * 0.08,
                  }}
                  whileHover={
                    shouldReduceMotion
                      ? {}
                      : {
                        y: -4,
                        boxShadow: "0 14px 35px rgba(0, 0, 0, 0.08)",
                      }
                  }
                >
                  <motion.div
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"
                    animate={shouldReduceMotion ? {} : { y: [0, -4, 0] }}
                    transition={{
                      duration: 2.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.25,
                    }}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </motion.div>

                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            id="join"
            className="lg:sticky lg:top-24"
            {...softScale}
            transition={{ duration: 0.35, ease: "easeOut", delay: 0.18 }}
            whileHover={
              shouldReduceMotion
                ? {}
                : {
                  y: -4,
                  boxShadow: "0 18px 45px rgba(0, 0, 0, 0.1)",
                }
            }
          >
            <Card className="p-6 shadow-xl">
              <h2 className="font-display text-xl font-bold">Join a room</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Enter the room code your host shared with you.
              </p>

              <form
                className="mt-5 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleJoinRoom();
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
                    onValueChange={(value) =>
                      setRole(value as "player" | "spectator")
                    }
                    className="mt-2 grid grid-cols-2 gap-2"
                  >
                    {(["player", "spectator"] as const).map((joinRole) => (
                      <Label
                        key={joinRole}
                        htmlFor={`role-${joinRole}`}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background p-3 text-sm capitalize transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                      >
                        <RadioGroupItem
                          value={joinRole}
                          id={`role-${joinRole}`}
                        />
                        {joinRole}
                      </Label>
                    ))}
                  </RadioGroup>
                </div>

                <motion.div
                  whileHover={shouldReduceMotion ? {} : { y: -2 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className="h-12 w-full"
                    disabled={isJoining}
                  >
                    {isJoining ? "Joining..." : "Join Room"}
                  </Button>
                </motion.div>
              </form>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}