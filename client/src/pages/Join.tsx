import { useLocation } from "wouter";
import RoomJoin from "@/components/RoomJoin";

export default function Join() {
  const [, setLocation] = useLocation();

  const handleJoinRoom = (roomCode: string) => {
    console.log("Joining room:", roomCode);
    setLocation(`/hunt/${roomCode}`);
  };

  return (
    <RoomJoin
      onJoinRoom={handleJoinRoom}
      onCreateInstead={() => setLocation("/create")}
    />
  );
}
