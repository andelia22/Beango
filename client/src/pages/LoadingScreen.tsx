import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { migrateAnonymousDataToAccount } from "@/lib/dataMigration";
import mascotImage from "@assets/coming-soon-real_1763827924724.png";

export default function LoadingScreen() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const migrationAttempted = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    
    async function handleNavigation() {
      if (isAuthenticated && !migrationAttempted.current) {
        migrationAttempted.current = true;
        try {
          await migrateAnonymousDataToAccount();
        } catch (error) {
          console.error("Migration failed:", error);
        }
      }

      const timer = setTimeout(() => {
        if (isAuthenticated) {
          setLocation("/welcome");
        } else {
          setLocation("/interests");
        }
      }, 2000);

      return () => clearTimeout(timer);
    }

    const cleanup = handleNavigation();
    return () => {
      cleanup.then(clearFn => clearFn?.());
    };
  }, [setLocation, isAuthenticated, isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="text-center max-w-md">
        <div className="relative">
          <img 
            src={mascotImage} 
            alt="BeanGo Mascot" 
            className="w-48 h-auto mx-auto animate-bounce"
            data-testid="img-loading-mascot"
          />
        </div>
        <h1 className="mt-8 text-3xl font-bold bg-gradient-to-r from-pink-600 to-pink-700 bg-clip-text text-transparent">
          Welcome to BeanGo
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Explore cities with friends through exciting scavenger hunts
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <div className="w-2 h-2 bg-pink-600 rounded-full animate-pulse" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 bg-pink-600 rounded-full animate-pulse" style={{ animationDelay: "200ms" }}></div>
          <div className="w-2 h-2 bg-pink-600 rounded-full animate-pulse" style={{ animationDelay: "400ms" }}></div>
        </div>
      </div>
    </div>
  );
}
