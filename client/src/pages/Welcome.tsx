import { useLocation } from "wouter";
import WelcomeScreen from "@/components/WelcomeScreen";

export default function Welcome() {
  const [, setLocation] = useLocation();

  return (
    <WelcomeScreen
      onCreateRoom={() => setLocation("/create")}
      onJoinRoom={() => setLocation("/join")}
    />
  );
}
