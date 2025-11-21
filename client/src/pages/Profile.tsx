import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, MapPin } from "lucide-react";
import type { BeangoCompletion } from "@shared/schema";

export default function Profile() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

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
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || user.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.profileImageUrl || undefined} alt={`${user.firstName} ${user.lastName}`} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-pink-500 to-pink-600 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl">
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.email || "BeanGo User"}
            </CardTitle>
            {user.email && <CardDescription>{user.email}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-pink-50 dark:bg-pink-900/20">
                <div className="flex justify-center mb-2">
                  <Trophy className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="text-2xl font-bold">{completions.length}</div>
                <div className="text-sm text-muted-foreground">BeanGos Completed</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-pink-50 dark:bg-pink-900/20">
                <div className="flex justify-center mb-2">
                  <MapPin className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="text-2xl font-bold">
                  {new Set(completions.map(c => c.cityId)).size}
                </div>
                <div className="text-sm text-muted-foreground">Cities Explored</div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={() => window.location.href = "/api/logout"}
                variant="outline"
                className="w-full"
                data-testid="button-logout"
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
