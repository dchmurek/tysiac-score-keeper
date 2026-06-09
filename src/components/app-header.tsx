import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Spade } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { currentUser, notifications } from "@/lib/mock-data";

interface AppHeaderProps {
  variant?: "marketing" | "app";
}

const marketingLinks = [
  { to: "/", label: "Home" },
  { to: "/rankings", label: "Rankings" },
  { to: "/history", label: "Match History" },
];

const appLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/room/r-active", label: "Active Room" },
  { to: "/history", label: "History" },
  { to: "/rankings", label: "Rankings" },
];

export function AppHeader({ variant = "marketing" }: AppHeaderProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const links = variant === "app" ? appLinks : marketingLinks;
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-lg font-bold tracking-tight"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Spade className="h-5 w-5" />
          </span>
          <span>Tysiac Score</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = pathname === l.to || (l.to !== "/" && pathname.startsWith(l.to));
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  active && "bg-secondary text-foreground",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {variant === "app" ? (
            <>
              <Link to="/notifications" className="relative">
                <Button variant="ghost" size="icon" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                </Button>
                {unread > 0 && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
                )}
              </Link>
              <Link to="/profile">
                <Avatar className="h-9 w-9 ring-2 ring-border">
                  <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                    {currentUser.initials}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : (
            <>
              <Link to="/sign-in" className="hidden sm:block">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/sign-up">
                <Button>Create Account</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
