import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Gamepad2, History, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/room/r-active", label: "Room", icon: Gamepad2 },
  { to: "/history", label: "History", icon: History },
  { to: "/rankings", label: "Rankings", icon: Trophy },
  { to: "/profile", label: "Profile", icon: User },
];

export function MobileBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (to !== "/dashboard" && pathname.startsWith(to));
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors",
                  active && "text-primary",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
