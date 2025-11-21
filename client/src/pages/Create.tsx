import { useState } from "react";
import { useLocation } from "wouter";
import RoomCreation from "@/components/RoomCreation";
import RoomCodeDisplay from "@/components/RoomCodeDisplay";
import { addRoom } from "@/lib/roomStore";

export default function Create() {
  const [, setLocation] = useLocation();
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [cityName, setCityName] = useState<string>("");

  const generateRoomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const part1 = Array.from({ length: 3 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
    const part2 = Array.from({ length: 3 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
    return `${part1}-${part2}`;
  };

  const handleCreateRoom = (city: string) => {
    setCityName(city);
    const code = generateRoomCode();
    addRoom(code, city);
    setRoomCode(code);
    console.log("Room created:", { city, code });
  };

  const handleContinue = () => {
    if (roomCode) {
      setLocation(`/hunt/${roomCode}`);
    }
  };

  if (roomCode) {
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
