import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

interface SubmitButtonProps {
  totalTasks: number;
  completedTasks: number;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export default function SubmitButton({
  totalTasks,
  completedTasks,
  onSubmit,
  isSubmitting = false,
}: SubmitButtonProps) {
  const allComplete = completedTasks >= totalTasks;

  return (
    <div className="pt-8 pb-12">
      {!allComplete && (
        <p className="text-center text-sm text-muted-foreground mb-4" data-testid="text-progress">
          {completedTasks}/{totalTasks} tasks complete
        </p>
      )}
      <Button
        onClick={onSubmit}
        disabled={!allComplete || isSubmitting}
        className="w-full h-12 text-base font-semibold"
        data-testid="button-submit-hunt"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Submitting...
          </>
        ) : allComplete ? (
          <>
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Submit Scavenger Hunt
          </>
        ) : (
          "Complete all tasks to submit"
        )}
      </Button>
    </div>
  );
}
