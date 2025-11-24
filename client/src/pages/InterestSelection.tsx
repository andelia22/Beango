import { useLocation } from "wouter";
import { PillSelector } from "@/components/PillSelector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Users, Trophy } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <img 
              src={mascotImage} 
              alt="BeanGo Mascot" 
              className="w-24 h-auto"
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
                <h3 className="font-semibold text-sm">24 Challenges Per City</h3>
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
            <h3 className="text-center font-semibold mb-4">What type of traveler are you?</h3>
            <p className="text-center text-sm text-muted-foreground mb-6">
              Select your interests to personalize your BeanGo experience
            </p>
            
            <PillSelector
              options={TRAVEL_INTERESTS}
              onNext={handleNext}
              onSkip={handleSkip}
              nextButtonText="Next"
              skipButtonText="Skip for now"
              requireMinSelection={true}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
