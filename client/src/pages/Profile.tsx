import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, MapPin, Home, LogIn, Edit } from "lucide-react";
import { signInWithGoogle, signOut } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { BeangoCompletion } from "@shared/schema";

export default function Profile() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { toast } = useToast();

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      window.location.reload();
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Sign in failed",
        description: "Please try again",
        variant: "destructive",
      });
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      window.location.href = "/";
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign out failed",
        description: "Please try again",
        variant: "destructive",
      });
      setIsSigningOut(false);
    }
  };

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
                onClick={handleSignIn}
                className="w-full"
                data-testid="button-signin"
                disabled={isSigningIn}
              >
                <LogIn className="w-4 h-4 mr-2" />
                {isSigningIn ? "Signing in..." : "Sign In"}
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

            {user.interests && user.interests.length > 0 && (
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Your Interests</h3>
                  <Button
                    onClick={() => setLocation("/interests?edit=true")}
                    variant="ghost"
                    size="sm"
                    data-testid="button-edit-interests"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest) => (
                    <Badge
                      key={interest}
                      variant="secondary"
                      className="text-sm"
                      data-testid={`badge-interest-${interest.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {(!user.interests || user.interests.length === 0) && (
              <div className="pt-4 space-y-3">
                <div className="text-center p-4 rounded-lg bg-pink-50 dark:bg-pink-900/20">
                  <p className="text-sm text-muted-foreground mb-3">
                    Share your interests to personalize your BeanGo experience
                  </p>
                  <Button
                    onClick={() => setLocation("/interests?edit=true")}
                    variant="outline"
                    size="sm"
                    data-testid="button-add-interests"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Add Interests
                  </Button>
                </div>
              </div>
            )}

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
                onClick={handleSignOut}
                variant="outline"
                className="w-full"
                data-testid="button-logout"
                disabled={isSigningOut}
              >
                {isSigningOut ? "Signing out..." : "Sign Out"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
