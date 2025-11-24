import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, MapPin, Home, LogIn } from "lucide-react";
import type { BeangoCompletion } from "@shared/schema";

export default function Profile() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: completions = [], isLoading: completionsLoading } = useQuery<BeangoCompletion[]>({
    queryKey: ["/api/beango-completions"],
    enabled: isAuthenticated,
  });

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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign In Required</CardTitle>
            <CardDescription>
              Create an account to view your profile and track your progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-6">
              <LogIn className="w-16 h-16 text-pink-600 mx-auto mb-4" />
              <p className="text-muted-foreground mb-6">
                Sign in to see your BeanGo stats, completed cities, and achievements
              </p>
            </div>
            <div className="space-y-2">
              <Button
                onClick={() => window.location.href = "/api/auth/login"}
                className="w-full"
                data-testid="button-signin"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              <Button
                onClick={() => setLocation("/welcome")}
                variant="outline"
                className="w-full"
                data-testid="button-back-to-welcome"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Welcome
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

            <div className="pt-4 space-y-3">
              <Button
                onClick={() => setLocation("/welcome")}
                variant="outline"
                className="w-full"
                data-testid="button-back-to-welcome"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Welcome
              </Button>
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
