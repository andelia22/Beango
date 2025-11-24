import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import mascotImage from "@assets/coming-soon-real_1763827924724.png";

export default function LoadingScreen() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        setLocation("/welcome");
      } else {
        setLocation("/interests");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [setLocation, isAuthenticated, isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="relative">
          <img 
            src={mascotImage} 
            alt="BeanGo Mascot" 
            className="w-48 h-auto mx-auto animate-bounce"
            data-testid="img-loading-mascot"
          />
        </div>
        <h1 className="mt-8 text-2xl font-bold bg-gradient-to-r from-pink-600 to-pink-700 bg-clip-text text-transparent">
          BeanGo
        </h1>
        <div className="mt-4 flex justify-center gap-2">
          <div className="w-2 h-2 bg-pink-600 rounded-full animate-pulse" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 bg-pink-600 rounded-full animate-pulse" style={{ animationDelay: "200ms" }}></div>
          <div className="w-2 h-2 bg-pink-600 rounded-full animate-pulse" style={{ animationDelay: "400ms" }}></div>
        </div>
      </div>
    </div>
  );
}
