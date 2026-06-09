import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/sign-in")({
  head: () => ({ meta: [{ title: "Sign In — Tysiac Score" }, { name: "description", content: "Sign in to your Tysiac Score account." }] }),
  component: SignInPage,
});

function SignInPage() {
  return (
    <div className="min-h-screen felt-gradient">
      <AppHeader />
      <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
        <Card className="p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to manage rooms and view your stats.</p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Signed in");
            }}
          >
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" className="mt-2 h-11" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" className="mt-2 h-11" />
            </div>
            <Button type="submit" className="h-12 w-full text-base">Sign In</Button>
          </form>
          <div className="mt-5 flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
            <Link to="/sign-up" className="text-primary hover:underline">Create account</Link>
          </div>
          <p className="mt-4 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
            You can join a match as a guest and connect it to your account later.
          </p>
        </Card>
      </div>
    </div>
  );
}
