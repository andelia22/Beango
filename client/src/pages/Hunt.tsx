import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import TaskFeed from "@/components/TaskFeed";
import { getDeviceId } from "@/lib/deviceId";
import { saveBeanGoCompletion } from "@/lib/anonymousStorage";
import type { Challenge, City, Room, RoomParticipant } from "@shared/schema";

interface RoomWithParticipants extends Room {
  participants: RoomParticipant[];
  selectedChallengeIds: number[] | null;
}

export default function Hunt() {
  const [, params] = useRoute("/hunt/:code");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const roomCode = params?.code || "DEMO-123";
  const deviceId = getDeviceId();

  const { data: roomData, isLoading: roomLoading } = useQuery<RoomWithParticipants>({
    queryKey: ["/api/rooms", roomCode],
    queryFn: async () => {
      const response = await fetch(`/api/rooms/${roomCode}`);
      if (!response.ok) {
        throw new Error("Room not found");
      }
      return response.json();
    },
    refetchInterval: 2000, // Poll for room updates (including refreshed challenges)
  });

  // Redirect to lobby if hunt hasn't started yet
  useEffect(() => {
    if (!roomLoading && roomData?.status === "waiting") {
      setLocation(`/lobby/${roomCode}`);
    }
  }, [roomLoading, roomData?.status, roomCode, setLocation]);

  // Find participant by userId first (for cross-device sync), then fall back to deviceId
  const myParticipant = roomData?.participants?.find(p => {
    if (isAuthenticated && user?.id && p.userId === user.id) {
      return true;
    }
    return p.deviceId === deviceId;
  });
  const cityId = roomData?.cityId || "caracas";

  const saveCompletionMutation = useMutation({
    mutationFn: async (data: { cityId: string; cityName: string; cityImageUrl: string | null; roomCode: string; participantCount: number }) => {
      return await apiRequest("POST", "/api/beango-completions", data);
    },
  });

  const { data: city } = useQuery<City>({
    queryKey: ["/api/cities", cityId],
    queryFn: async () => {
      const response = await fetch(`/api/cities`);
      const cities = await response.json();
      return cities.find((c: City) => c.id === cityId);
    },
    enabled: !!cityId,
  });

  const selectedChallengeIds = roomData?.selectedChallengeIds;
  
  const { data: challenges = [], isLoading, error } = useQuery<Challenge[]>({
    queryKey: ["/api/cities", cityId, "challenges", selectedChallengeIds],
    queryFn: async () => {
      const response = await fetch(`/api/cities/${cityId}/challenges`);
      if (!response.ok) {
        throw new Error(`Failed to load challenges for city '${cityId}'`);
      }
      const allChallenges: Challenge[] = await response.json();
      
      // If room has selected challenges, filter to only show those
      if (selectedChallengeIds && selectedChallengeIds.length > 0) {
        const selectedSet = new Set(selectedChallengeIds);
        return allChallenges.filter(c => selectedSet.has(c.id));
      }
      
      // Fallback for rooms created before this feature
      return allChallenges.slice(0, 12);
    },
    enabled: !!cityId,
  });

  if (roomLoading || isLoading || !city) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading challenges...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-destructive mb-2">City Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The city for this room could not be found. The room may have been created with an invalid city.
          </p>
          <button
            onClick={() => setLocation("/")}
            className="text-primary hover:underline"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    try {
      await apiRequest("PATCH", `/api/rooms/${roomCode}/complete`, {});
      // Invalidate history queries so the room moves to completed section
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ["/api/rooms/by-user"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/rooms/by-device", deviceId] });
      }
    } catch (error) {
      console.error("Failed to mark room as complete:", error);
    }
    
    if (isAuthenticated) {
      try {
        await saveCompletionMutation.mutateAsync({
          cityId: city.id,
          cityName: city.name,
          cityImageUrl: challenges[0]?.imageUrl || null,
          roomCode,
          participantCount: roomData?.participants?.length || 1,
        });
        toast({
          title: "BeanGo Completed!",
          description: "Your completion has been saved.",
        });
      } catch (error) {
        console.error("Failed to save completion:", error);
        toast({
          title: "Failed to save completion",
          description: "Your progress couldn't be saved. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      saveBeanGoCompletion({
        roomCode,
        cityId: city.id,
        cityName: city.name,
        cityImageUrl: challenges[0]?.imageUrl || null,
        participantCount: roomData?.participants?.length || 1,
        completedAt: new Date().toISOString(),
      });
      toast({
        title: "BeanGo Completed!",
        description: "Sign in to save your progress permanently.",
      });
    }
    setLocation(`/stats/${roomCode}`);
  };

  return (
    <TaskFeed
      cityName={city.name}
      roomCode={roomCode}
      tasks={challenges}
      onSubmit={handleSubmit}
    />
  );
}
