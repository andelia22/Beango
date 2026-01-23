import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import RoomCreation from "@/components/RoomCreation";
import RoomCodeDisplay from "@/components/RoomCodeDisplay";
import { getDeviceId } from "@/lib/deviceId";
import { apiRequest } from "@/lib/queryClient";
import type { City } from "@shared/schema";

export default function Create() {
  const [, setLocation] = useLocation();
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [cityId, setCityId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

  const { data: cities } = useQuery<City[]>({
    queryKey: ["/api/cities"],
  });

  const generateRoomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const part1 = Array.from({ length: 3 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
    const part2 = Array.from({ length: 3 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
    return `${part1}-${part2}`;
  };

  const handleCreateRoom = async (selectedCityId: string) => {
    setIsCreating(true);
    setCityId(selectedCityId);
    const code = generateRoomCode();
    const city = cities?.find(c => c.id === selectedCityId);
    const deviceId = getDeviceId();
    
    try {
      await apiRequest("POST", "/api/rooms", {
        code,
        cityId: selectedCityId,
        cityName: city?.name || selectedCityId,
        createdBy: deviceId,
        totalChallenges: city?.challengeCount || 0,
      });
      setRoomCode(code);
    } catch (error) {
      console.error("Failed to create room:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleContinue = () => {
    if (roomCode) {
      setLocation(`/lobby/${roomCode}`);
    }
  };

  if (roomCode) {
    const cityName = cities?.find(c => c.id === cityId)?.name || "";
    return (
      <RoomCodeDisplay
        roomCode={roomCode}
        cityName={cityName}
        onContinue={handleContinue}
        onBack={() => setRoomCode(null)}
      />
    );
  }

  return <RoomCreation onCreateRoom={handleCreateRoom} onBack={() => setLocation("/welcome")} />;
}
