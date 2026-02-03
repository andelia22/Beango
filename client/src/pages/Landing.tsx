import { useState } from "react";
import { Redirect } from "wouter";
import { useAuthContext } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Users, Trophy } from "lucide-react";
import mascotImage from "@assets/coming-soon-real_1763827924724.png";
import { signInWithGoogle } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const { isAuthenticated, isLoading, refreshAuth } = useAuthContext();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      await refreshAuth();
      setIsSigningIn(false);
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Sign in failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
      setIsSigningIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <img 
              src={mascotImage} 
              alt="BeanGo Mascot" 
              className="w-32 h-auto"
              data-testid="img-mascot"
            />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-pink-700 bg-clip-text text-transparent">
            Welcome to BeanGo
          </CardTitle>
          <CardDescription className="text-base">
            Explore cities with friends through exciting scavenger hunts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">15 Challenges Per City</h3>
                <p className="text-sm text-muted-foreground">
                  Complete location-based tasks and discover hidden gems
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Play with Friends</h3>
                <p className="text-sm text-muted-foreground">
                  Create or join rooms with unique codes
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Track Your Journey</h3>
                <p className="text-sm text-muted-foreground">
                  View your history and achievements
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleSignIn}
              className="w-full"
              size="lg"
              data-testid="button-login"
              disabled={isSigningIn}
            >
              {isSigningIn ? "Signing in..." : "Sign In with Google"}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              Secure authentication powered by Firebase
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
