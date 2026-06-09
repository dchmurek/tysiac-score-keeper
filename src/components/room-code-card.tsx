import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Copy, Share2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RoomCodeCardProps {
  code: string;
  className?: string;
}

export function RoomCodeCard({ code, className }: RoomCodeCardProps) {
  return (
    <Card className={cn("p-5", className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Room Code</p>
      <div className="mt-2 flex items-center justify-between gap-4">
        <span className="score-display text-5xl text-primary sm:text-6xl">{code}</span>
        <div className="grid h-20 w-20 place-items-center rounded-lg border-2 border-dashed border-border bg-muted/40">
          <QrCode className="h-10 w-10 text-muted-foreground" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => {
            navigator.clipboard?.writeText(code);
            toast.success("Room code copied");
          }}
        >
          <Copy className="h-4 w-4" /> Copy
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={() => toast.success("Share link ready")}>
          <Share2 className="h-4 w-4" /> Share
        </Button>
      </div>
    </Card>
  );
}
