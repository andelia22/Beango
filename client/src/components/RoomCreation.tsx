import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface RoomCreationProps {
  onCreateRoom: (cityName: string) => void;
}

export default function RoomCreation({ onCreateRoom }: RoomCreationProps) {
  const [selectedCity] = useState("Caracas");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-chart-2/5">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Create Scavenger Hunt</CardTitle>
          <CardDescription>
            Start a new adventure in {selectedCity} with your friends
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">City</label>
            <div className="p-4 bg-accent rounded-md border border-accent-border">
              <p className="font-medium text-lg">{selectedCity}</p>
              <p className="text-sm text-muted-foreground">24 exciting tasks to complete</p>
            </div>
          </div>

          <Button
            onClick={() => onCreateRoom(selectedCity)}
            className="w-full h-12 text-base font-semibold"
            data-testid="button-create-room"
          >
            Create Room
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
