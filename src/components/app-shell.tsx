import type { ReactNode } from "react";
import { AppHeader } from "./app-header";
import { MobileBottomNav } from "./mobile-bottom-nav";

interface AppShellProps {
  children: ReactNode;
  hideBottomNav?: boolean;
}

export function AppShell({ children, hideBottomNav }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader variant="app" />
      <main className="flex-1 pb-24 md:pb-12">{children}</main>
      {!hideBottomNav && <MobileBottomNav />}
    </div>
  );
}
