import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import TaskFeed from "@/components/TaskFeed";
import { getRoom } from "@/lib/roomStore";
import type { Challenge, City } from "@shared/schema";

export default function Hunt() {
  const [, params] = useRoute("/hunt/:code");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const roomCode = params?.code || "DEMO-123";

  const room = getRoom(roomCode);
  const cityId = room?.cityId || "caracas";

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

  const { data: challenges = [], isLoading, error } = useQuery<Challenge[]>({
    queryKey: ["/api/cities", cityId, "challenges"],
    queryFn: async () => {
      const response = await fetch(`/api/cities/${cityId}/challenges`);
      if (!response.ok) {
        throw new Error(`Failed to load challenges for city '${cityId}'`);
      }
      return response.json();
    },
    enabled: !!cityId,
  });

  if (isLoading || !city) {
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
    if (isAuthenticated) {
      try {
        await saveCompletionMutation.mutateAsync({
          cityId: city.id,
          cityName: city.name,
          cityImageUrl: challenges[0]?.imageUrl || null,
          roomCode,
          participantCount: 1,
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
      toast({
        title: "Not logged in",
        description: "You must be logged in to save your progress.",
        variant: "destructive",
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
