import { useLocation } from "wouter";
import RoomJoin from "@/components/RoomJoin";
import { roomExists } from "@/lib/roomStore";

export default function Join() {
  const [, setLocation] = useLocation();

  const handleJoinRoom = async (roomCode: string): Promise<boolean> => {
    console.log("Attempting to join room:", roomCode);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const exists = roomExists(roomCode);
    
    if (exists) {
      setLocation(`/hunt/${roomCode}`);
      return true;
    }
    
    return false;
  };

  return (
    <RoomJoin
      onJoinRoom={handleJoinRoom}
      onCreateInstead={() => setLocation("/create")}
    />
  );
}
