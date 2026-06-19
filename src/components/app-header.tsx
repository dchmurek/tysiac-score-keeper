import { Link } from "@tanstack/react-router";
import { Spade } from "lucide-react";

interface AppHeaderProps {
  variant?: "marketing" | "app";
}

export function AppHeader({ variant: _variant = "marketing" }: AppHeaderProps) {
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
      </div>
    </header>
  );
}