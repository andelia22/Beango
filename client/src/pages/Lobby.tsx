import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, ArrowRight, ArrowLeft, Users, Loader2 } from "lucide-react";
import { getDeviceId } from "@/lib/deviceId";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface Participant {
  id: string;
  deviceId: string;
  userId: string | null;
  deviceName: string | null;
}

interface RoomData {
  code: string;
  cityId: string;
  cityName: string;
  status: string;
  hostDeviceId: string | null;
  hostUserId: string | null;
  hostFirstName: string | null;
  participants: Participant[];
  totalChallenges: number;
}

export default function Lobby() {
  const [, params] = useRoute("/lobby/:code");
  const [, setLocation] = useLocation();
  const roomCode = params?.code || "";
  const deviceId = getDeviceId();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const { data: room, isLoading, refetch } = useQuery<RoomData>({
    queryKey: ["/api/rooms", roomCode],
    refetchInterval: 2000,
    enabled: !!roomCode,
  });

  const startHuntMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/rooms/${roomCode}/start-hunt`, { deviceId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms", roomCode] });
      setLocation(`/hunt/${roomCode}`);
    },
  });

  useEffect(() => {
    if (room?.status === "in_progress") {
      setLocation(`/hunt/${roomCode}`);
    }
  }, [room?.status, roomCode, setLocation]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartHunt = async () => {
    setIsStarting(true);
    try {
      await startHuntMutation.mutateAsync();
    } catch (error) {
      console.error("Failed to start hunt:", error);
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-chart-2/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-chart-2/5">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p>Room not found</p>
            <Button onClick={() => setLocation("/welcome")} className="mt-4">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if current user is the host - check userId first (for cross-device sync), then deviceId
  const isHost = (user?.id && room.hostUserId === user.id) || room.hostDeviceId === deviceId;
  const hostDisplayName = room.hostFirstName || "room creator";
  const participantCount = room.participants?.length || 1;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-chart-2/5">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/welcome")}
              data-testid="button-back-from-lobby"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1" />
          </div>
          <CardTitle className="text-2xl" data-testid="text-room-title">
            {isHost ? "Room Created!" : "Joined Room!"}
          </CardTitle>
          <CardDescription>
            Share this code with your friends to join the {room.cityName} BeanGo adventure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 bg-primary/5 rounded-lg border-2 border-primary/20 text-center">
            <p className="text-sm text-muted-foreground mb-2">Your Room Code</p>
            <div className="flex items-center justify-center gap-3">
              <p className="text-4xl font-mono font-bold tracking-wider" data-testid="text-room-code">
                {roomCode}
              </p>
              <Button
                size="icon"
                variant="ghost"
                onClick={copyRoomCode}
                data-testid="button-copy-room-code"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-primary" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <p className="font-medium">Participants ({participantCount})</p>
            </div>
            <div className="space-y-2">
              {room.participants?.map((participant, index) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-2 text-sm"
                  data-testid={`participant-${index}`}
                >
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>
                    {participant.deviceId === room.hostDeviceId
                      ? `${room.hostFirstName || "Host"} (Host)`
                      : `Player ${index + 1}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {isHost ? (
            <Button
              onClick={handleStartHunt}
              disabled={isStarting}
              className="w-full h-12 text-base font-semibold"
              data-testid="button-start-hunt"
            >
              {isStarting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  Start Hunt
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          ) : (
            <div className="p-4 bg-muted/30 rounded-lg text-center" data-testid="text-waiting-message">
              <p className="text-muted-foreground">
                Wait for {hostDisplayName} to start the hunt!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
