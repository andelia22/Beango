import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { signInWithGoogle } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export function AppFooter() {
  const { isAuthenticated } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { toast } = useToast();

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      await queryClient.fetchQuery({ queryKey: ['/api/auth/user'] });
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

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border z-40">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <Button
          onClick={handleSignIn}
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          data-testid="button-footer-signin"
          disabled={isSigningIn}
        >
          <LogIn className="w-4 h-4 mr-2" />
          {isSigningIn ? "Signing in..." : "Sign In"}
        </Button>
      </div>
    </div>
  );
}
