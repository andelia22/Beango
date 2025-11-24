import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import StatsPage from "@/components/StatsPage";
import { SignInPrompt } from "@/components/SignInPrompt";
import { getRoom } from "@/lib/roomStore";
import { useAuth } from "@/hooks/useAuth";
import type { City } from "@shared/schema";

export default function Stats() {
  const [, params] = useRoute("/stats/:code");
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const roomCode = params?.code || "DEMO-123";
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

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

  useEffect(() => {
    if (!isAuthenticated) {
      setShowSignInPrompt(true);
    }
  }, [isAuthenticated]);

  return (
    <>
      <StatsPage
        roomCode={roomCode}
        cityName={city?.name || ""}
        participants={participants}
        totalTasks={city?.challengeCount || 24}
        onBackToHome={() => setLocation("/welcome")}
      />
      {showSignInPrompt && (
        <SignInPrompt
          message="Great job completing this BeanGo! Sign in to save your progress and track all your achievements"
          onDismiss={() => setShowSignInPrompt(false)}
          suppressAfterDismiss={false}
        />
      )}
    </>
  );
}
