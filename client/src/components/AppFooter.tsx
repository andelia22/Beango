import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export function AppFooter() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border z-40">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <Button
          onClick={() => window.location.href = "/api/auth/login"}
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          data-testid="button-footer-signin"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Sign In
        </Button>
      </div>
    </div>
  );
}
