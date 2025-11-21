import { useRoute, useLocation } from "wouter";
import StatsPage from "@/components/StatsPage";

export default function Stats() {
  const [, params] = useRoute("/stats/:code");
  const [, setLocation] = useLocation();
  const roomCode = params?.code || "DEMO-123";

  const participants = [
    { id: "1", name: "You", tasksCompleted: 24 },
    { id: "2", name: "Maria", tasksCompleted: 22 },
    { id: "3", name: "James", tasksCompleted: 18 },
    { id: "4", name: "Sofia", tasksCompleted: 15 },
  ];

  return (
    <StatsPage
      roomCode={roomCode}
      cityName="Caracas"
      participants={participants}
      totalTasks={24}
      onBackToHome={() => setLocation("/")}
    />
  );
}
