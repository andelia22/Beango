import { Heart } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export type TaskStatus = "incomplete" | "completed-by-me" | "completed-by-others" | "completed-by-me-and-others";

interface CompletionInfo {
  name: string | null;
  isMe: boolean;
}

interface TaskCardProps {
  taskNumber: number;
  imageUrl: string;
  caption: string;
  status: TaskStatus;
  completedBy?: CompletionInfo[];
  onToggle: () => void;
}

export default function TaskCard({
  taskNumber,
  imageUrl,
  caption,
  status,
  completedBy,
  onToggle,
}: TaskCardProps) {
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleDoubleTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTap;
    
    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      triggerToggle();
    }
    
    setLastTap(now);
  };

  const triggerToggle = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setShowHeartAnimation(true);
    setTimeout(() => {
      setShowHeartAnimation(false);
      setIsAnimating(false);
    }, 600);
    
    onToggle();
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerToggle();
  };

  const getOthersText = () => {
    if (!completedBy || completedBy.length === 0) return "";
    const others = completedBy.filter(c => !c.isMe);
    if (others.length === 0) return "";
    
    const firstName = others[0].name || "teammate";
    if (others.length === 1) {
      return `Completed by ${firstName}`;
    }
    return `Completed by ${firstName} and ${others.length - 1} other${others.length > 2 ? 's' : ''}`;
  };

  const getStatusContent = () => {
    const isCompletedByMe = status === "completed-by-me" || status === "completed-by-me-and-others";
    const isCompletedByOthers = status === "completed-by-others" || status === "completed-by-me-and-others";
    
    switch (status) {
      case "incomplete":
        return (
          <div className="flex items-center gap-2 text-muted-foreground">
            <button
              onClick={handleHeartClick}
              className="hover-elevate active-elevate-2 p-1 rounded-full transition-all duration-200"
              data-testid={`button-heart-${taskNumber}`}
              aria-label="Mark as complete"
            >
              <Heart className="h-5 w-5 transition-all duration-200" />
            </button>
            <span className="text-sm">Tap heart or double tap to complete</span>
          </div>
        );
      case "completed-by-me":
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={handleHeartClick}
              className="hover-elevate active-elevate-2 p-1 rounded-full transition-all duration-200"
              data-testid={`button-heart-${taskNumber}`}
              aria-label="Mark as incomplete"
            >
              <Heart className="h-5 w-5 fill-primary text-primary transition-all duration-200 animate-in zoom-in-50" />
            </button>
            <Badge variant="default" className="bg-primary text-primary-foreground animate-in slide-in-from-left-2">
              Completed by you
            </Badge>
          </div>
        );
      case "completed-by-others":
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={handleHeartClick}
              className="hover-elevate active-elevate-2 p-1 rounded-full transition-all duration-200"
              data-testid={`button-heart-${taskNumber}`}
              aria-label="Mark as complete"
            >
              <Heart className="h-5 w-5 fill-chart-2 text-chart-2 transition-all duration-200" />
            </button>
            <Badge variant="secondary" className="bg-chart-2 text-white animate-in slide-in-from-left-2">
              {getOthersText()}
            </Badge>
          </div>
        );
      case "completed-by-me-and-others":
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleHeartClick}
              className="hover-elevate active-elevate-2 p-1 rounded-full transition-all duration-200"
              data-testid={`button-heart-${taskNumber}`}
              aria-label="Mark as incomplete"
            >
              <Heart className="h-5 w-5 fill-primary text-primary transition-all duration-200" />
            </button>
            <Badge variant="default" className="bg-primary text-primary-foreground">
              Completed by you
            </Badge>
            <Badge variant="secondary" className="bg-chart-2 text-white">
              +{(completedBy?.filter(c => !c.isMe).length || 0)} other{(completedBy?.filter(c => !c.isMe).length || 0) > 1 ? 's' : ''}
            </Badge>
          </div>
        );
    }
  };

  const isCompletedByMe = status === "completed-by-me" || status === "completed-by-me-and-others";
  const isCompletedByOthers = status === "completed-by-others" || status === "completed-by-me-and-others";

  const getBorderStyle = () => {
    if (isCompletedByMe) {
      return "border-primary shadow-lg shadow-primary/20";
    }
    if (isCompletedByOthers) {
      return "border-chart-2 shadow-lg shadow-chart-2/20";
    }
    return "border-card-border";
  };

  return (
    <div className="mb-6" data-testid={`card-task-${taskNumber}`}>
      <div className={`bg-card rounded-lg overflow-hidden border transition-all duration-300 ${getBorderStyle()}`}>
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
            className={`w-full h-full object-cover transition-all duration-300 ${
              status === "completed-by-me" ? "brightness-110" : ""
            }`}
          />
          
          {showHeartAnimation && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Heart
                className="h-24 w-24 fill-primary text-primary"
                style={{
                  animation: "heartBounce 600ms ease-out",
                }}
              />
            </div>
          )}
          
          {isCompletedByMe && (
            <div className="absolute inset-0 border-4 border-primary pointer-events-none animate-in fade-in-0 duration-300" />
          )}
          {isCompletedByOthers && !isCompletedByMe && (
            <div className="absolute inset-0 border-4 border-chart-2 pointer-events-none animate-in fade-in-0 duration-300" />
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
