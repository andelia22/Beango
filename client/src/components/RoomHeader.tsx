import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface RoomHeaderProps {
  cityName: string;
  roomCode: string;
}

export default function RoomHeader({ cityName, roomCode }: RoomHeaderProps) {
  const [copied, setCopied] = useState(false);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-city-name">
          {cityName}
        </h1>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-muted-foreground" data-testid="text-room-code">
            {roomCode}
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={copyRoomCode}
            data-testid="button-copy-code"
          >
            {copied ? (
              <Check className="h-4 w-4 text-primary" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
