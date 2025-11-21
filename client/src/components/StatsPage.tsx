import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Participant {
  id: string;
  name: string;
  tasksCompleted: number;
}

interface StatsPageProps {
  roomCode: string;
  cityName: string;
  participants: Participant[];
  totalTasks: number;
  onBackToHome: () => void;
}

export default function StatsPage({
  roomCode,
  cityName,
  participants,
  totalTasks,
  onBackToHome,
}: StatsPageProps) {
  const sortedParticipants = [...participants].sort(
    (a, b) => b.tasksCompleted - a.tasksCompleted
  );

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Medal className="h-5 w-5 text-amber-600" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-chart-2/10 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-stats-title">
            Hunt Complete!
          </h1>
          <p className="text-muted-foreground">
            {cityName} • Room {roomCode}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {sortedParticipants.map((participant, index) => (
              <div
                key={participant.id}
                className={`flex items-center gap-4 p-4 rounded-lg ${
                  index === 0
                    ? "bg-primary/5 border-2 border-primary/20"
                    : "bg-muted/30"
                }`}
                data-testid={`leaderboard-entry-${index + 1}`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 text-center font-bold text-lg">
                    {index === 0 || index === 1 || index === 2 ? (
                      getRankIcon(index)
                    ) : (
                      <span className="text-muted-foreground">{index + 1}</span>
                    )}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={index === 0 ? "bg-primary text-primary-foreground" : ""}>
                      {participant.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium" data-testid={`text-participant-name-${index + 1}`}>
                      {participant.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {participant.tasksCompleted} / {totalTasks} tasks
                    </p>
                  </div>
                </div>
                <Badge
                  variant={index === 0 ? "default" : "secondary"}
                  data-testid={`badge-score-${index + 1}`}
                >
                  {participant.tasksCompleted}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="mt-8 space-y-3">
          <Button
            onClick={onBackToHome}
            className="w-full h-12 text-base font-semibold"
            data-testid="button-back-home"
          >
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
