import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RoomCodeCardProps {
  code: string;
  className?: string;
}

export function RoomCodeCard({ code, className }: RoomCodeCardProps) {
  const joinUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?code=${code}`
      : "";

  return (
    <Card className={cn("flex min-h-[220px] flex-col p-5", className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Room Code
      </p>

      <p className="mt-6 font-mono text-6xl font-bold tracking-widest text-primary sm:text-7xl">
        {code}
      </p>

      <div className="mt-auto grid grid-cols-2 gap-3 pt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            navigator.clipboard?.writeText(code);
            toast.success("Room code copied");
          }}
        >
          <Copy className="h-4 w-4" /> Copy
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            if (navigator.share && joinUrl) {
              await navigator.share({
                title: "Join my Tysiac room",
                url: joinUrl,
              });
              return;
            }

            if (joinUrl) {
              await navigator.clipboard?.writeText(joinUrl);
              toast.success("Join link copied");
              return;
            }

            toast.success("Share link ready");
          }}
        >
          <Share2 className="h-4 w-4" /> Share
        </Button>
      </div>
    </Card>
  );
}