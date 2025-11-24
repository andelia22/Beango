import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, LogIn } from "lucide-react";

interface SignInPromptProps {
  message?: string;
  onDismiss?: () => void;
  suppressAfterDismiss?: boolean;
}

export function SignInPrompt({ 
  message = "Sign in to save your progress and see all your completed BeanGos",
  onDismiss,
  suppressAfterDismiss = false
}: SignInPromptProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleSignIn = () => {
    window.location.href = "/api/auth/login";
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center">
      <Card className="max-w-md w-full shadow-lg border-pink-200 dark:border-pink-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <LogIn className="w-5 h-5 text-pink-600" />
                <h3 className="font-semibold">Nice work!</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {message}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleSignIn}
                  size="sm"
                  className="flex-1"
                  data-testid="button-signin-prompt"
                >
                  Sign In
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  data-testid="button-dismiss-prompt"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              data-testid="button-close-prompt"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
