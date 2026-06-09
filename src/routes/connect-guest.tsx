import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, Link2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/connect-guest")({
  head: () => ({ meta: [{ title: "Connect Guest Match — Tysiac Score" }] }),
  component: ConnectGuest,
});

function ConnectGuest() {
  return (
    <div className="min-h-screen felt-gradient">
      <AppHeader />
      <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
        <Card className="p-6 sm:p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
            <Link2 className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold">Connect guest match</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You played as <strong className="text-foreground">Bary</strong>. Sign in or create an account to add this match to your statistics.
          </p>

          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="text-center">
              <Avatar className="mx-auto h-12 w-12"><AvatarFallback className="bg-warning/30 text-sm font-bold">BA</AvatarFallback></Avatar>
              <p className="mt-1 text-xs text-muted-foreground">Guest</p>
              <p className="font-semibold">Bary</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div className="text-center">
              <Avatar className="mx-auto h-12 w-12"><AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">BA</AvatarFallback></Avatar>
              <p className="mt-1 text-xs text-muted-foreground">Account</p>
              <p className="font-semibold">Bartek</p>
            </div>
          </div>

          <p className="mt-4 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
            The guest nickname and account username may be different.
          </p>

          <div className="mt-6 grid gap-2">
            <Button onClick={() => toast.success("Match connected to Bartek")}>Confirm connection</Button>
            <Link to="/sign-in"><Button variant="outline" className="w-full">Sign in to a different account</Button></Link>
            <Link to="/sign-up"><Button variant="ghost" className="w-full">Create account</Button></Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
