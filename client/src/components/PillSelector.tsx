import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PillSelectorProps {
  options: string[];
  onNext: (selected: string[]) => void;
  onSkip?: () => void;
  nextButtonText?: string;
  skipButtonText?: string;
  requireMinSelection?: boolean;
}

export function PillSelector({
  options,
  onNext,
  onSkip,
  nextButtonText = "Next",
  skipButtonText = "Skip",
  requireMinSelection = true,
}: PillSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelection = (option: string) => {
    setSelected(prev =>
      prev.includes(option)
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  const handleNext = () => {
    onNext(selected);
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onNext([]);
    }
  };

  const isNextDisabled = requireMinSelection && selected.length === 0;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap gap-2 justify-center">
        {options.map((option) => (
          <Badge
            key={option}
            variant={selected.includes(option) ? "default" : "outline"}
            className={`cursor-pointer px-3.5 py-2 md:px-4 md:py-2 text-sm transition-all ${
              selected.includes(option)
                ? "bg-pink-600 text-white hover:bg-pink-700"
                : "hover-elevate"
            }`}
            onClick={() => toggleSelection(option)}
            data-testid={`pill-${option.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {option}
          </Badge>
        ))}
      </div>

      <div className="flex flex-col gap-2 md:gap-3">
        <Button
          onClick={handleNext}
          disabled={isNextDisabled}
          size="lg"
          className="w-full"
          data-testid="button-next"
        >
          {nextButtonText}
        </Button>
        {onSkip !== undefined && (
          <Button
            onClick={handleSkip}
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            data-testid="button-skip"
          >
            {skipButtonText}
          </Button>
        )}
      </div>
    </div>
  );
}
