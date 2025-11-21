import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users } from "lucide-react";

interface RoomJoinProps {
  onJoinRoom: (roomCode: string) => void;
  onCreateInstead: () => void;
}

export default function RoomJoin({ onJoinRoom, onCreateInstead }: RoomJoinProps) {
  const [roomCode, setRoomCode] = useState("");

  const formatRoomCode = (value: string) => {
    const clean = value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    if (clean.length <= 3) return clean;
    return `${clean.slice(0, 3)}-${clean.slice(3, 6)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRoomCode(e.target.value);
    setRoomCode(formatted);
  };

  const handleJoin = () => {
    if (roomCode.length === 7) {
      onJoinRoom(roomCode);
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
              className="text-center text-lg font-mono tracking-wider h-12"
              data-testid="input-room-code"
            />
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleJoin}
              disabled={roomCode.length !== 7}
              className="w-full h-12 text-base font-semibold"
              data-testid="button-join-room"
            >
              Join Room
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
