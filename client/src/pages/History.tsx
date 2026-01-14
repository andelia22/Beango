import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Calendar, Home, Play, Eye, Clock } from "lucide-react";
import { getDeviceId } from "@/lib/deviceId";
import type { BeangoCompletion, Room } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

interface RoomWithProgress extends Room {
  completedCount: number;
}

export default function History() {
  const [, setLocation] = useLocation();
  const deviceId = getDeviceId();
  const { isAuthenticated } = useAuth();

  const { data: rooms = [], isLoading: roomsLoading } = useQuery<RoomWithProgress[]>({
    queryKey: ["/api/rooms/by-device", deviceId],
    queryFn: async () => {
      const response = await fetch(`/api/rooms/by-device/${deviceId}`);
      if (!response.ok) return [];
      return response.json();
    },
  });

  const { data: completions = [], isLoading: completionsLoading } = useQuery<BeangoCompletion[]>({
    queryKey: ["/api/beango-completions"],
    enabled: isAuthenticated,
  });

  const isLoading = roomsLoading || (isAuthenticated && completionsLoading);

  const inProgressRooms = rooms.filter(r => r.status === "in_progress");
  const completedRooms = rooms.filter(r => r.status === "completed");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  const hasNoRooms = rooms.length === 0 && completions.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="gap-2">
            <CardTitle className="text-3xl flex items-center gap-2">
              <MapPin className="w-8 h-8 text-pink-600" />
              Your Adventures
            </CardTitle>
            <CardDescription>
              Resume in-progress hunts or view your completed BeanGos
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Button
              onClick={() => setLocation("/welcome")}
              variant="outline"
              className="w-full"
              data-testid="button-back-to-welcome"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Welcome
            </Button>
          </CardContent>
        </Card>

        {hasNoRooms ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                  <MapPin className="w-10 h-10 text-pink-600 dark:text-pink-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">No Adventures Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start your first scavenger hunt to see it here!
              </p>
              <Button onClick={() => setLocation("/create")} data-testid="button-start-hunt">
                Start a Hunt
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {inProgressRooms.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground">
                  <Clock className="w-5 h-5 text-amber-500" />
                  In Progress
                </h2>
                <div className="grid gap-4">
                  {inProgressRooms.map((room) => (
                    <Card key={room.code} className="overflow-hidden hover-elevate" data-testid={`card-room-${room.code}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold truncate" data-testid={`text-city-${room.code}`}>
                                {room.cityName}
                              </h3>
                              <Badge variant="secondary" className="shrink-0">
                                {room.completedCount} / {room.totalChallenges}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="font-mono text-xs">{room.code}</span>
                              {room.updatedAt && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(room.updatedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            onClick={() => setLocation(`/hunt/${room.code}`)}
                            data-testid={`button-resume-${room.code}`}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Resume
                          </Button>
                        </div>
                        <div className="mt-3">
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${(room.completedCount / room.totalChallenges) * 100}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {(completedRooms.length > 0 || completions.length > 0) && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground">
                  <MapPin className="w-5 h-5 text-green-500" />
                  Completed
                </h2>
                <div className="grid gap-4">
                  {completedRooms.map((room) => (
                    <Card key={room.code} className="overflow-hidden" data-testid={`card-completed-${room.code}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold truncate">
                                {room.cityName}
                              </h3>
                              <Badge variant="outline" className="shrink-0 text-green-600 border-green-600">
                                Complete
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="font-mono text-xs">{room.code}</span>
                              {room.updatedAt && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(room.updatedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => setLocation(`/stats/${room.code}`)}
                            data-testid={`button-view-${room.code}`}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {isAuthenticated && completions.map((completion) => (
                    <Card key={completion.id} className="overflow-hidden" data-testid={`card-completion-${completion.id}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold truncate" data-testid={`text-city-${completion.id}`}>
                                {completion.cityName}
                              </h3>
                              <Badge variant="outline" className="shrink-0 text-green-600 border-green-600">
                                Complete
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {completion.participantCount}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(completion.completedAt).toLocaleDateString()}
                              </span>
                              <span className="font-mono text-xs">{completion.roomCode}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
