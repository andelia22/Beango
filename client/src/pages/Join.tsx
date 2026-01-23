import { useLocation } from "wouter";
import RoomJoin from "@/components/RoomJoin";
import { getDeviceId } from "@/lib/deviceId";
import { apiRequest } from "@/lib/queryClient";

export default function Join() {
  const [, setLocation] = useLocation();

  const handleJoinRoom = async (roomCode: string): Promise<boolean> => {
    const deviceId = getDeviceId();
    
    try {
      const response = await apiRequest("POST", `/api/rooms/${roomCode}/join`, {
        deviceId,
      });
      
      if (response.ok) {
        setLocation(`/lobby/${roomCode}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to join room:", error);
      return false;
    }
  };

  return (
    <RoomJoin
      onJoinRoom={handleJoinRoom}
      onCreateInstead={() => setLocation("/create")}
      onBack={() => setLocation("/welcome")}
    />
  );
}
