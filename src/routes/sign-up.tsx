import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/sign-up")({
  head: () => ({
    meta: [
      { title: "Create Account — Tysiac Score" },
      { name: "description", content: "Create your Tysiac Score account." },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  return (
    <div className="min-h-screen felt-gradient">
      <AppHeader />
      <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
        <Card className="p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold">Create account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track every match, every round, every win.
          </p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Account created");
            }}
          >
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="adam" className="mt-2 h-11" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" className="mt-2 h-11" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pw">Password</Label>
                <Input id="pw" type="password" className="mt-2 h-11" />
              </div>
              <div>
                <Label htmlFor="pw2">Confirm</Label>
                <Input id="pw2" type="password" className="mt-2 h-11" />
              </div>
            </div>
            <Button type="submit" className="h-12 w-full text-base">
              Create Account
            </Button>
          </form>
          <p className="mt-4 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
            You can join a match as a guest and connect it to your account later. Your guest
            nickname doesn't have to match your account username.
          </p>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/sign-in" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
