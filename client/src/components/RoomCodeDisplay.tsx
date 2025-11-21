import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { useState } from "react";

interface RoomCodeDisplayProps {
  roomCode: string;
  cityName: string;
  onContinue: () => void;
  onBack: () => void;
}

export default function RoomCodeDisplay({ roomCode, cityName, onContinue, onBack }: RoomCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-chart-2/5">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              data-testid="button-back-from-code"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1" />
          </div>
          <CardTitle className="text-2xl">Room Created!</CardTitle>
          <CardDescription>
            Share this code with your friends to join the {cityName} scavenger hunt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 bg-primary/5 rounded-lg border-2 border-primary/20 text-center">
            <p className="text-sm text-muted-foreground mb-2">Your Room Code</p>
            <div className="flex items-center justify-center gap-3">
              <p className="text-4xl font-mono font-bold tracking-wider" data-testid="text-generated-code">
                {roomCode}
              </p>
              <Button
                size="icon"
                variant="ghost"
                onClick={copyRoomCode}
                data-testid="button-copy-generated-code"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-primary" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          <Button
            onClick={onContinue}
            className="w-full h-12 text-base font-semibold"
            data-testid="button-start-hunt"
          >
            Start Hunt
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
