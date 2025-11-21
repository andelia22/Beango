import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import TaskFeed from "@/components/TaskFeed";
import { getRoom } from "@/lib/roomStore";
import type { Challenge, City } from "@shared/schema";

export default function Hunt() {
  const [, params] = useRoute("/hunt/:code");
  const [, setLocation] = useLocation();
  const roomCode = params?.code || "DEMO-123";

  const room = getRoom(roomCode);
  const cityId = room?.cityId || "caracas";

  const { data: city } = useQuery<City>({
    queryKey: ["/api/cities", cityId],
    queryFn: async () => {
      const response = await fetch(`/api/cities`);
      const cities = await response.json();
      return cities.find((c: City) => c.id === cityId);
    },
    enabled: !!cityId,
  });

  const { data: challenges = [], isLoading } = useQuery<Challenge[]>({
    queryKey: ["/api/cities", cityId, "challenges"],
    queryFn: async () => {
      const response = await fetch(`/api/cities/${cityId}/challenges`);
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

  return (
    <TaskFeed
      cityName={city.name}
      roomCode={roomCode}
      tasks={challenges}
      onSubmit={() => setLocation(`/stats/${roomCode}`)}
    />
  );
}
