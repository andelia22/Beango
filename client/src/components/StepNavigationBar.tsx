import { Lock } from "lucide-react";
import type { Step, StepStatus } from "@/hooks/useStepProgression";

interface StepNavigationBarProps {
  steps: Step[];
  activeStepIndex: number;
  onStepClick: (index: number) => void;
  canNavigateToStep: (index: number) => boolean;
}

function StepIndicator({
  step,
  isActive,
  onClick,
  canNavigate,
}: {
  step: Step;
  isActive: boolean;
  onClick: () => void;
  canNavigate: boolean;
}) {
  const getIndicatorStyles = (status: StepStatus, isActive: boolean) => {
    const baseStyles = "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 relative overflow-hidden";
    
    if (status === "locked") {
      return `${baseStyles} bg-muted border-2 border-muted-foreground/20 cursor-not-allowed opacity-60`;
    }
    
    if (status === "completed") {
      return `${baseStyles} border-2 border-chart-2 cursor-pointer`;
    }
    
    if (isActive || status === "active") {
      return `${baseStyles} border-3 border-primary ring-2 ring-primary/30 cursor-pointer`;
    }
    
    return `${baseStyles} border-2 border-muted-foreground/40 cursor-pointer hover:border-primary/50`;
  };

  const getRingStyles = (status: StepStatus, isActive: boolean) => {
    if (status === "locked") return "";
    
    if (status === "completed") {
      return "ring-2 ring-chart-2/50";
    }
    
    if (isActive || status === "active") {
      return "ring-2 ring-primary";
    }
    
    return "";
  };

  const handleClick = () => {
    if (canNavigate && step.status !== "locked") {
      onClick();
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={handleClick}
        disabled={step.status === "locked"}
        className={`${getIndicatorStyles(step.status, isActive)} ${getRingStyles(step.status, isActive)}`}
        data-testid={`step-indicator-${step.index + 1}`}
        aria-label={`Step ${step.index + 1}: ${step.status}`}
      >
        {step.status === "locked" ? (
          <Lock className="w-4 h-4 text-muted-foreground" />
        ) : step.thumbnailImageUrl ? (
          <img
            src={step.thumbnailImageUrl}
            alt={`Step ${step.index + 1}`}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <span className="text-sm font-medium text-muted-foreground">
            {step.index + 1}
          </span>
        )}
        
        {step.status === "completed" && (
          <div className="absolute inset-0 flex items-center justify-center bg-chart-2/20 rounded-full">
            <div className="w-3 h-3 bg-chart-2 rounded-full" />
          </div>
        )}
      </button>
      
      <div className="flex gap-0.5">
        {step.challenges.map((_, idx) => (
          <div
            key={idx}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              idx < step.completedCount
                ? "bg-chart-2"
                : step.status === "locked"
                ? "bg-muted-foreground/20"
                : "bg-muted-foreground/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function StepNavigationBar({
  steps,
  activeStepIndex,
  onStepClick,
  canNavigateToStep,
}: StepNavigationBarProps) {
  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-1 overflow-x-auto scrollbar-hide">
          {steps.map((step, idx) => (
            <StepIndicator
              key={step.index}
              step={step}
              isActive={idx === activeStepIndex}
              onClick={() => onStepClick(idx)}
              canNavigate={canNavigateToStep(idx)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
