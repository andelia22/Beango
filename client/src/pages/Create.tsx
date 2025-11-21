import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import RoomCreation from "@/components/RoomCreation";
import RoomCodeDisplay from "@/components/RoomCodeDisplay";
import { addRoom } from "@/lib/roomStore";
import type { City } from "@shared/schema";

export default function Create() {
  const [, setLocation] = useLocation();
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [cityId, setCityId] = useState<string>("");

  const { data: cities } = useQuery<City[]>({
    queryKey: ["/api/cities"],
  });

  const generateRoomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const part1 = Array.from({ length: 3 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
    const part2 = Array.from({ length: 3 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
    return `${part1}-${part2}`;
  };

  const handleCreateRoom = (selectedCityId: string) => {
    setCityId(selectedCityId);
    const code = generateRoomCode();
    addRoom(code, selectedCityId);
    setRoomCode(code);
    console.log("Room created:", { cityId: selectedCityId, code });
  };

  const handleContinue = () => {
    if (roomCode) {
      setLocation(`/hunt/${roomCode}`);
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

  return <RoomCreation onCreateRoom={handleCreateRoom} onBack={() => setLocation("/")} />;
}
