import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, X, ChevronRight } from "lucide-react";
import { notifications } from "@/lib/mock-data";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Tysiac Score" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold">Notifications</h1>
          <Button variant="ghost" size="sm">Mark all read</Button>
        </div>

        <div className="mt-6 space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={cn("flex items-start gap-3 p-4", !n.read && "border-primary/40 bg-primary/5")}>
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{n.message}</p>
                  {!n.read && <Badge variant="default" className="h-4 text-[9px]">New</Badge>}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{format(new Date(n.timestamp), "MMM d, HH:mm")}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {n.type === "confirmation" && (
                    <>
                      <Button size="sm" onClick={() => toast.success("Accepted")}><Check className="h-3.5 w-3.5" /> Accept</Button>
                      <Button size="sm" variant="outline" onClick={() => toast.success("Rejected")}><X className="h-3.5 w-3.5" /> Reject</Button>
                    </>
                  )}
                  {n.type === "trusted-host" && (
                    <>
                      <Button size="sm" onClick={() => toast.success("Trusted")}>Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => toast.success("Declined")}>Decline</Button>
                    </>
                  )}
                  {n.type === "guest-match" && (
                    <Button size="sm" variant="outline">Connect guest <ChevronRight className="h-3.5 w-3.5" /></Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
