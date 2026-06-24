import { Link } from "@tanstack/react-router";
import { Moon, Spade, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem("tysiac-theme");

    const dark =
      saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);

    setIsDark(dark);

    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const applyTheme = (dark: boolean) => {
    setIsDark(dark);

    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("tysiac-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("tysiac-theme", "light");
    }
  };

  const handleToggleTheme = () => {
    const next = !isDark;

    if (document.startViewTransition) {
      document.startViewTransition(() => applyTheme(next));
    } else {
      applyTheme(next);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Spade className="h-5 w-5" />
          </span>
          Tysiac Score
        </Link>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleToggleTheme}
          className="transition-transform hover:-translate-y-0.5 active:scale-95"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}