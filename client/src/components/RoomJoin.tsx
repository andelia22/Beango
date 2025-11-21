import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, AlertCircle } from "lucide-react";

interface RoomJoinProps {
  onJoinRoom: (roomCode: string) => Promise<boolean>;
  onCreateInstead: () => void;
}

export default function RoomJoin({ onJoinRoom, onCreateInstead }: RoomJoinProps) {
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const formatRoomCode = (value: string) => {
    const clean = value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    if (clean.length <= 3) return clean;
    return `${clean.slice(0, 3)}-${clean.slice(3, 6)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRoomCode(e.target.value);
    setRoomCode(formatted);
    setError(null);
  };

  const handleJoin = async () => {
    if (roomCode.length === 7) {
      setIsValidating(true);
      setError(null);
      
      const isValid = await onJoinRoom(roomCode);
      
      setIsValidating(false);
      
      if (!isValid) {
        setError("Room not found. Please check the code and try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-chart-2/5 via-background to-primary/5">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-chart-2/10 rounded-full flex items-center justify-center mb-2">
            <Users className="h-6 w-6 text-chart-2" />
          </div>
          <CardTitle className="text-2xl">Join Scavenger Hunt</CardTitle>
          <CardDescription>
            Enter the room code to join your friends' adventure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="room-code" className="text-sm font-medium">
              Room Code
            </label>
            <Input
              id="room-code"
              value={roomCode}
              onChange={handleInputChange}
              placeholder="ABC-123"
              maxLength={7}
              className={`text-center text-lg font-mono tracking-wider h-12 transition-all ${
                error ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
              data-testid="input-room-code"
            />
            {error && (
              <div
                className="flex items-center gap-2 text-sm text-destructive animate-in slide-in-from-top-1"
                data-testid="text-error-room-not-found"
              >
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleJoin}
              disabled={roomCode.length !== 7 || isValidating}
              className="w-full h-12 text-base font-semibold"
              data-testid="button-join-room"
            >
              {isValidating ? "Validating..." : "Join Room"}
            </Button>
            
            <Button
              onClick={onCreateInstead}
              variant="ghost"
              className="w-full"
              data-testid="button-create-instead"
            >
              Create a new room instead
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
