import { Heart, User } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export type TaskStatus = "incomplete" | "completed-by-me" | "completed-by-friend";

interface TaskCardProps {
  taskNumber: number;
  imageUrl: string;
  caption: string;
  status: TaskStatus;
  completedBy?: string;
  onComplete: () => void;
}

export default function TaskCard({
  taskNumber,
  imageUrl,
  caption,
  status,
  completedBy,
  onComplete,
}: TaskCardProps) {
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [lastTap, setLastTap] = useState(0);

  const handleDoubleTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTap;
    
    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      if (status === "incomplete") {
        setShowHeartAnimation(true);
        setTimeout(() => setShowHeartAnimation(false), 600);
        onComplete();
      }
    }
    
    setLastTap(now);
  };

  const getStatusContent = () => {
    switch (status) {
      case "incomplete":
        return (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Heart className="h-4 w-4" />
            <span className="text-sm">Double tap to complete</span>
          </div>
        );
      case "completed-by-me":
        return (
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 fill-primary text-primary" />
            <Badge variant="default" className="bg-primary text-primary-foreground">
              Completed by you
            </Badge>
          </div>
        );
      case "completed-by-friend":
        return (
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 fill-chart-2 text-chart-2" />
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-chart-2 text-white">
                {completedBy?.charAt(0) || "F"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              Completed by {completedBy || "Friend"}
            </span>
          </div>
        );
    }
  };

  return (
    <div className="mb-6" data-testid={`card-task-${taskNumber}`}>
      <div className="bg-card rounded-lg overflow-hidden border border-card-border">
        <div className="p-3 flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            Task {taskNumber}
          </Badge>
        </div>
        
        <div
          className="relative aspect-[4/3] overflow-hidden cursor-pointer select-none"
          onClick={handleDoubleTap}
          data-testid={`button-complete-task-${taskNumber}`}
        >
          <img
            src={imageUrl}
            alt={caption}
            className="w-full h-full object-cover"
          />
          
          {showHeartAnimation && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Heart
                className="h-24 w-24 fill-primary text-primary animate-in zoom-in-0 fade-in-0 duration-300"
                style={{
                  animation: "heartBounce 600ms ease-out",
                }}
              />
            </div>
          )}
          
          {status === "completed-by-me" && (
            <div className="absolute inset-0 border-4 border-primary pointer-events-none" />
          )}
        </div>
        
        <div className="p-4 space-y-3">
          <p className="text-base leading-relaxed" data-testid={`text-task-caption-${taskNumber}`}>
            {caption}
          </p>
          <div data-testid={`status-task-${taskNumber}`}>
            {getStatusContent()}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes heartBounce {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
