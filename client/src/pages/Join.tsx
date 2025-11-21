import { useLocation } from "wouter";
import RoomJoin from "@/components/RoomJoin";
import { joinRoom } from "@/lib/roomStore";

export default function Join() {
  const [, setLocation] = useLocation();

  const handleJoinRoom = async (roomCode: string): Promise<boolean> => {
    console.log("Attempting to join room:", roomCode);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const success = joinRoom(roomCode);
    
    if (success) {
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
