import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import type { City } from "@shared/schema";

interface RoomCreationProps {
  onCreateRoom: (cityId: string) => void;
  onBack: () => void;
}

export default function RoomCreation({ onCreateRoom, onBack }: RoomCreationProps) {
  const [selectedCityId, setSelectedCityId] = useState<string>("");

  const { data: cities, isLoading } = useQuery<City[]>({
    queryKey: ["/api/cities"],
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-chart-2/5">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              data-testid="button-back-from-create"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1" />
          </div>
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Create BeanGo Room</CardTitle>
          <CardDescription>
            Start a new BeanGo adventure with your friends
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="city-select" className="text-sm font-medium">City</label>
            {isLoading ? (
              <div className="flex items-center justify-center h-12 border rounded-md">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <Select value={selectedCityId} onValueChange={setSelectedCityId}>
                  <SelectTrigger id="city-select" className="h-12" data-testid="select-city">
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities?.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCityId && cities && (
                  <p className="text-sm text-muted-foreground">
                    {cities.find(c => c.id === selectedCityId)?.challengeCount} exciting challenges on the board
                  </p>
                )}
              </>
            )}
          </div>

          <Button
            onClick={() => onCreateRoom(selectedCityId)}
            disabled={!selectedCityId || isLoading}
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
