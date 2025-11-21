import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Users, Calendar } from "lucide-react";
import type { BeangoCompletion } from "@shared/schema";

export default function History() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: completions = [], isLoading: completionsLoading } = useQuery<BeangoCompletion[]>({
    queryKey: ["/api/beango-completions"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading || completionsLoading) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <MapPin className="w-8 h-8 text-pink-600" />
              Your BeanGo History
            </CardTitle>
            <CardDescription>
              All your completed city scavenger hunts
            </CardDescription>
          </CardHeader>
        </Card>

        {completions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                  <MapPin className="w-10 h-10 text-pink-600 dark:text-pink-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">No BeanGos Yet</h3>
              <p className="text-muted-foreground mb-4">
                Complete your first scavenger hunt to see it here!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {completions.map((completion) => (
              <Card key={completion.id} className="overflow-hidden" data-testid={`card-completion-${completion.id}`}>
                <div className="flex flex-col sm:flex-row">
                  {completion.cityImageUrl && (
                    <div className="w-full sm:w-48 h-48 sm:h-auto flex-shrink-0">
                      <img
                        src={completion.cityImageUrl}
                        alt={completion.cityName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="flex-1 p-6">
                    <h3 className="text-xl font-bold mb-2" data-testid={`text-city-${completion.id}`}>
                      {completion.cityName}
                    </h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span data-testid={`text-participants-${completion.id}`}>
                          {completion.participantCount} {completion.participantCount === 1 ? "participant" : "participants"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(completion.completedAt).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs font-mono">Room: {completion.roomCode}</span>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
