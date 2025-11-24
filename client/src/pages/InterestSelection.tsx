import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { PillSelector } from "@/components/PillSelector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import mascotImage from "@assets/coming-soon-real_1763827924724.png";

const TRAVEL_INTERESTS = [
  "Culture & History",
  "Nature & Outdoors",
  "Food & Drink",
  "Shopping & Markets",
  "Art & Creativity",
  "Photo & Video Challenges",
  "Puzzles & Clues",
  "Social & Interaction",
  "Movement & Exploration",
  "Sports & Play",
  "Nightlife & Ambience",
  "Audio / Sound-Based",
  "Group Challenges"
];

export default function InterestSelection() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const isEditMode = new URLSearchParams(location.split('?')[1]).get('edit') === 'true';
  const initialInterests = isEditMode && user?.interests ? user.interests : [];

  const saveInterestsMutation = useMutation({
    mutationFn: async (interests: string[]) => {
      return apiRequest("PATCH", "/api/auth/user/interests", { interests });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Interests saved",
        description: "Your interests have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save interests. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNext = async (selected: string[]) => {
    if (isAuthenticated) {
      await saveInterestsMutation.mutateAsync(selected);
      if (isEditMode) {
        setLocation("/profile");
      } else {
        setLocation("/welcome");
      }
    } else {
      localStorage.setItem("userInterests", JSON.stringify(selected));
      setLocation("/welcome");
    }
  };

  const handleSkip = () => {
    if (isEditMode) {
      setLocation("/profile");
    } else {
      localStorage.removeItem("userInterests");
      setLocation("/welcome");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2 md:p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center space-y-1 pb-3 md:pb-6">
          <div className="flex justify-center mb-2 md:mb-4">
            <img 
              src={mascotImage} 
              alt="BeanGo Mascot" 
              className="w-14 md:w-24 h-auto"
              data-testid="img-mascot"
            />
          </div>
          <CardTitle className="text-xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-pink-700 bg-clip-text text-transparent leading-tight">
            What type of traveler are you?
          </CardTitle>
          <CardDescription className="text-sm md:text-base">
            Select your interests to personalize your BeanGo experience
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 md:space-y-6 pt-0 pb-4 md:pb-6">
          <PillSelector
            options={TRAVEL_INTERESTS}
            initialSelected={initialInterests}
            onNext={handleNext}
            onSkip={handleSkip}
            nextButtonText={isEditMode ? "Save Changes" : "Next"}
            skipButtonText={isEditMode ? "Cancel" : "Skip for now"}
            requireMinSelection={!isEditMode}
          />
        </CardContent>
      </Card>
    </div>
  );
}
