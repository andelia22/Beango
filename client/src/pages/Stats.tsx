import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import StatsPage from "@/components/StatsPage";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useAuth } from "@/hooks/useAuth";
import type { City, Room } from "@shared/schema";

interface LeaderboardEntry {
  id: string;
  name: string;
  tasksCompleted: number;
}

export default function Stats() {
  const [, params] = useRoute("/stats/:code");
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const roomCode = params?.code || "";
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

  const { data: room, isLoading: roomLoading } = useQuery<Room>({
    queryKey: ["/api/rooms", roomCode],
    enabled: !!roomCode,
  });

  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/rooms", roomCode, "leaderboard"],
    queryFn: async () => {
      const response = await fetch(`/api/rooms/${roomCode}/leaderboard`);
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      return response.json();
    },
    enabled: !!roomCode,
  });

  const { data: city } = useQuery<City>({
    queryKey: ["/api/cities", room?.cityId],
    queryFn: async () => {
      const response = await fetch(`/api/cities`);
      const cities = await response.json();
      return cities.find((c: City) => c.id === room?.cityId);
    },
    enabled: !!room?.cityId,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setShowSignInPrompt(true);
    }
  }, [isAuthenticated]);

  const isLoading = roomLoading || leaderboardLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-chart-2/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <StatsPage
        roomCode={roomCode}
        cityName={city?.name || room?.cityName || ""}
        participants={leaderboard}
        totalTasks={room?.totalChallenges || 15}
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
