import { useRoute, useLocation } from "wouter";
import StatsPage from "@/components/StatsPage";
import { getRoom } from "@/lib/roomStore";

export default function Stats() {
  const [, params] = useRoute("/stats/:code");
  const [, setLocation] = useLocation();
  const roomCode = params?.code || "DEMO-123";

  const room = getRoom(roomCode);
  const participants = room?.participants || [];
  const cityName = room?.city || "Caracas";

  return (
    <StatsPage
      roomCode={roomCode}
      cityName={cityName}
      participants={participants}
      totalTasks={24}
      onBackToHome={() => setLocation("/")}
    />
  );
}
