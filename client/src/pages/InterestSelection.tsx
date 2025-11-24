import { useLocation } from "wouter";
import { PillSelector } from "@/components/PillSelector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  const [, setLocation] = useLocation();

  const handleNext = (selected: string[]) => {
    localStorage.setItem("userInterests", JSON.stringify(selected));
    setLocation("/welcome");
  };

  const handleSkip = () => {
    localStorage.removeItem("userInterests");
    setLocation("/welcome");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2 md:p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center space-y-1 pb-3 md:pb-6">
          <div className="flex justify-center mb-1 md:mb-4">
            <img 
              src={mascotImage} 
              alt="BeanGo Mascot" 
              className="w-12 md:w-24 h-auto"
              data-testid="img-mascot"
            />
          </div>
          <CardTitle className="text-xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-pink-700 bg-clip-text text-transparent leading-tight">
            What type of traveler are you?
          </CardTitle>
          <CardDescription className="text-xs md:text-base">
            Select your interests to personalize your BeanGo experience
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3 md:space-y-6 pt-0 pb-4 md:pb-6">
          <PillSelector
            options={TRAVEL_INTERESTS}
            onNext={handleNext}
            onSkip={handleSkip}
            nextButtonText="Next"
            skipButtonText="Skip for now"
            requireMinSelection={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
