import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { trustedHosts, currentUser } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, LogOut, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Tysiac Score" }] }),
  component: Settings,
});

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card className="p-5 sm:p-6">
      <div>
        <h2 className="font-display text-lg font-bold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <Separator className="my-4" />
      {children}
    </Card>
  );
}

function Settings() {
  const [rankings, setRankings] = useState(true);
  const [publicStats, setPublicStats] = useState(true);
  const [allowAdds, setAllowAdds] = useState(false);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile, privacy and trusted hosts.</p>

        <div className="mt-6 space-y-4">
          <Section title="Profile">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14"><AvatarFallback className="bg-primary/10 text-base font-bold text-primary">{currentUser.initials}</AvatarFallback></Avatar>
              <div className="flex-1">
                <Label htmlFor="uname">Username</Label>
                <Input id="uname" defaultValue={currentUser.username} className="mt-2" />
              </div>
            </div>
          </Section>

          <Section title="Email">
            <Label htmlFor="email">Current email</Label>
            <Input id="email" defaultValue={currentUser.email} className="mt-2" />
            <Button className="mt-3" variant="outline" onClick={() => toast.success("Email updated")}>Change email</Button>
          </Section>

          <Section title="Password">
            <div className="grid gap-3 sm:grid-cols-3">
              <div><Label>Current</Label><Input type="password" className="mt-2" /></div>
              <div><Label>New</Label><Input type="password" className="mt-2" /></div>
              <div><Label>Confirm</Label><Input type="password" className="mt-2" /></div>
            </div>
            <Button className="mt-3" variant="outline" onClick={() => toast.success("Password updated")}>Change password</Button>
          </Section>

          <Section title="Trusted hosts" description="Trusted hosts can add you to matches without manual confirmation.">
            <div className="space-y-2">
              {trustedHosts.map((h) => (
                <div key={h.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="font-medium">{h.username}</p>
                    <p className="text-xs text-muted-foreground capitalize">{h.status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={h.status === "active" ? "secondary" : "outline"}>{h.status}</Badge>
                    <Button size="icon" variant="ghost"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Input placeholder="Search username..." />
              <Button><Plus className="h-4 w-4" /> Send request</Button>
            </div>
          </Section>

          <Section title="Privacy">
            <div className="space-y-3">
              {[
                { label: "Show profile in rankings", val: rankings, set: setRankings },
                { label: "Show statistics publicly", val: publicStats, set: setPublicStats },
                { label: "Allow trusted hosts to add me to games", val: allowAdds, set: setAllowAdds },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span className="text-sm font-medium">{row.label}</span>
                  <Switch checked={row.val} onCheckedChange={row.set} />
                </div>
              ))}
            </div>
          </Section>

          <Section title="Security">
            <Button variant="outline"><LogOut className="h-4 w-4" /> Log out from all devices</Button>
          </Section>

          <Section title="Account">
            <Button variant="destructive"><AlertTriangle className="h-4 w-4" /> Deactivate account</Button>
          </Section>
        </div>
      </div>
    </AppShell>
  );
}
