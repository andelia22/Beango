import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import StatsPage from "@/components/StatsPage";
import { getRoom } from "@/lib/roomStore";
import type { City } from "@shared/schema";

export default function Stats() {
  const [, params] = useRoute("/stats/:code");
  const [, setLocation] = useLocation();
  const roomCode = params?.code || "DEMO-123";

  const room = getRoom(roomCode);
  const participants = room?.participants || [];
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

  return (
    <StatsPage
      roomCode={roomCode}
      cityName={city?.name || ""}
      participants={participants}
      totalTasks={city?.challengeCount || 24}
      onBackToHome={() => setLocation("/")}
    />
  );
}
