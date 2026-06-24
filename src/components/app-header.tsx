import { Link } from "@tanstack/react-router";
import { Moon, Spade, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  variant?: "marketing" | "app";
}

export function AppHeader({ variant: _variant = "marketing" }: AppHeaderProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedTheme = localStorage.getItem("tysiac-theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
      return;
    }

    if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
      return;
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (prefersDark) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const handleToggleTheme = () => {
    const nextIsDark = !isDark;

    setIsDark(nextIsDark);

    if (nextIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("tysiac-theme", "dark");
      return;
    }

    document.documentElement.classList.remove("dark");
    localStorage.setItem("tysiac-theme", "light");
  };

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

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          onClick={handleToggleTheme}
          className="transition-transform hover:-translate-y-0.5 active:scale-95"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}