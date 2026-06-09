import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset Password — Tysiac Score" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  return (
    <div className="min-h-screen felt-gradient">
      <AppHeader />
      <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
        <Card className="p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold">Forgot password</h1>
          <p className="mt-1 text-sm text-muted-foreground">We'll send a reset link to your email.</p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Reset link sent");
            }}
          >
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" className="mt-2 h-11" />
            </div>
            <Button type="submit" className="h-12 w-full text-base">Send reset link</Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link to="/sign-in" className="font-medium text-primary hover:underline">Back to sign in</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
