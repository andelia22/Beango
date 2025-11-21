import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, Camera } from "lucide-react";

interface WelcomeScreenProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
}

export default function WelcomeScreen({ onCreateRoom, onJoinRoom }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-chart-2/10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            BeanGo: City Scavenger Hunt
          </CardTitle>
          <CardDescription className="text-base">
            Explore the world with your friends and complete the BeanGo board
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button
              onClick={onCreateRoom}
              className="w-full h-12 text-base font-semibold"
              data-testid="button-welcome-create"
            >
              Create new BeanGo Room
            </Button>
            
            <Button
              onClick={onJoinRoom}
              variant="outline"
              className="w-full h-12 text-base font-semibold"
              data-testid="button-welcome-join"
            >
              Join Existing BeanGo Room
            </Button>
          </div>

          <div className="pt-6 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-md">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Collaborate with Friends</p>
                <p className="text-xs text-muted-foreground">
                  Create or join rooms to hunt together
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-md">
                <Camera className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">24 Unique Challenges</p>
                <p className="text-xs text-muted-foreground">
                  Complete the BeanGo board across the city
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-md">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Real-Time Updates</p>
                <p className="text-xs text-muted-foreground">
                  See when friends complete challenges instantly
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
