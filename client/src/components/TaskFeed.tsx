import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import TaskCard, { type TaskStatus } from "./TaskCard";
import SubmitButton from "./SubmitButton";
import RoomHeader from "./RoomHeader";
import StepNavigationBar from "./StepNavigationBar";
import { SignInPrompt } from "./SignInPrompt";
import { useAuth } from "@/hooks/useAuth";
import { useStepProgression, type StepChallenge } from "@/hooks/useStepProgression";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getDeviceId } from "@/lib/deviceId";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: number;
  imageUrl: string;
  caption: string;
  interests?: string[];
}

interface ChallengeCompletion {
  id: string;
  roomCode: string;
  challengeId: number;
  completedByDeviceId: string;
  completedByUserId: string | null;
  completedByName: string | null;
  completedAt: string;
}

interface CompletionInfo {
  name: string | null;
  isMe: boolean;
}

interface TaskFeedProps {
  cityName: string;
  roomCode: string;
  tasks: Task[];
  onSubmit: () => void;
}

export default function TaskFeed({ cityName, roomCode, tasks, onSubmit }: TaskFeedProps) {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const deviceId = getDeviceId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [hasShownPromptThisSession, setHasShownPromptThisSession] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const { data: completions = [] } = useQuery<ChallengeCompletion[]>({
    queryKey: ["/api/rooms", roomCode, "completions"],
    queryFn: async () => {
      const response = await fetch(`/api/rooms/${roomCode}/completions`);
      if (!response.ok) return [];
      return response.json();
    },
    refetchInterval: 2000,
  });

  const {
    steps,
    activeStepIndex,
    setActiveStepIndex,
    activeStep,
    canNavigateToStep,
    navigateToNextStep,
    navigateToPreviousStep,
    globalCompletedChallengeIds,
    totalCompletedCount,
  } = useStepProgression({
    challenges: tasks as StepChallenge[],
    completions,
  });

  const addCompletionMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      return apiRequest("POST", `/api/rooms/${roomCode}/challenges/${challengeId}/complete`, {
        deviceId,
        userName: user?.firstName || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms", roomCode, "completions"] });
    },
  });

  const removeCompletionMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      return apiRequest("DELETE", `/api/rooms/${roomCode}/challenges/${challengeId}/complete`, {
        deviceId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms", roomCode, "completions"] });
    },
  });

  const getCompletionsForTask = (taskId: number): CompletionInfo[] => {
    return completions
      .filter(c => c.challengeId === taskId)
      .map(c => ({
        name: c.completedByName,
        isMe: (isAuthenticated && user?.id && c.completedByUserId === user.id) || c.completedByDeviceId === deviceId,
      }));
  };

  const getTaskStatus = (taskId: number): TaskStatus => {
    const taskCompletions = getCompletionsForTask(taskId);
    const completedByMe = taskCompletions.some(c => c.isMe);
    const completedByOthers = taskCompletions.some(c => !c.isMe);

    if (completedByMe && completedByOthers) {
      return "completed-by-me-and-others";
    }
    if (completedByMe) {
      return "completed-by-me";
    }
    if (completedByOthers) {
      return "completed-by-others";
    }
    return "incomplete";
  };

  const handleTaskToggle = async (taskId: number) => {
    if (pendingToggle === taskId) return;
    
    const currentStatus = getTaskStatus(taskId);
    const isCurrentlyCompletedByMe = currentStatus === "completed-by-me" || currentStatus === "completed-by-me-and-others";
    
    setPendingToggle(taskId);
    
    try {
      if (isCurrentlyCompletedByMe) {
        await removeCompletionMutation.mutateAsync(taskId);
      } else {
        await addCompletionMutation.mutateAsync(taskId);
        
        if (!isAuthenticated && !hasShownPromptThisSession) {
          setShowSignInPrompt(true);
          setHasShownPromptThisSession(true);
        }
      }
    } catch (error) {
      console.error("Failed to toggle task:", error);
    } finally {
      setPendingToggle(null);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit();
    }, 2000);
  };

  const refreshMutation = useMutation({
    mutationFn: async (challengeIdsToReplace: number[]) => {
      return apiRequest("POST", `/api/rooms/${roomCode}/refresh-challenges`, {
        challengeIdsToReplace,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms", roomCode] });
      toast({
        title: "Challenges refreshed",
        description: "New challenges loaded for this step.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Refresh failed",
        description: error.message || "Could not refresh challenges. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRefresh = useCallback(async () => {
    const incompleteInCurrentStep = activeStep?.challenges.filter(
      c => !globalCompletedChallengeIds.has(c.id)
    ) || [];
    
    if (incompleteInCurrentStep.length === 0) {
      toast({
        title: "No challenges to refresh",
        description: "All challenges in this step are complete.",
        variant: "default",
      });
      return;
    }
    
    setIsRefreshing(true);
    try {
      const idsToReplace = incompleteInCurrentStep.map(c => c.id);
      await refreshMutation.mutateAsync(idsToReplace);
    } finally {
      setIsRefreshing(false);
    }
  }, [activeStep, globalCompletedChallengeIds, refreshMutation, toast]);

  const currentStepChallenges = activeStep?.challenges || [];
  const canGoBack = activeStepIndex > 0 && canNavigateToStep(activeStepIndex - 1);
  const canGoForward = activeStepIndex < steps.length - 1 && canNavigateToStep(activeStepIndex + 1);
  const isAllComplete = totalCompletedCount >= tasks.length;

  return (
    <div className="min-h-screen bg-background">
      <RoomHeader cityName={cityName} roomCode={roomCode} />
      
      <StepNavigationBar
        steps={steps}
        activeStepIndex={activeStepIndex}
        onStepClick={setActiveStepIndex}
        canNavigateToStep={canNavigateToStep}
      />
      
      <div className="max-w-2xl mx-auto px-4 py-6" ref={contentRef}>
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={navigateToPreviousStep}
            disabled={!canGoBack}
            className="h-10 w-10"
            data-testid="button-prev-step"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="text-center">
            <h2 className="text-lg font-semibold" data-testid="text-step-title">
              Step {activeStepIndex + 1} of {steps.length}
            </h2>
            <p className="text-sm text-muted-foreground">
              {activeStep?.completedCount || 0} / {currentStepChallenges.length} complete
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={navigateToNextStep}
            disabled={!canGoForward}
            className="h-10 w-10"
            data-testid="button-next-step"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {(() => {
          const incompleteCount = (activeStep?.challenges || []).filter(
            c => !globalCompletedChallengeIds.has(c.id)
          ).length;
          const hasIncomplete = incompleteCount > 0;
          
          if (!hasIncomplete || isAllComplete) return null;
          
          return (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Swap {incompleteCount} incomplete {incompleteCount === 1 ? 'challenge' : 'challenges'} for new ones
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                data-testid="button-refresh-step"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          );
        })()}

        {currentStepChallenges.map((task) => (
          <TaskCard
            key={task.id}
            taskNumber={task.id}
            imageUrl={task.imageUrl}
            caption={task.caption}
            status={getTaskStatus(task.id)}
            completedBy={getCompletionsForTask(task.id)}
            onToggle={() => handleTaskToggle(task.id)}
          />
        ))}
        
        <SubmitButton
          totalTasks={tasks.length}
          completedTasks={totalCompletedCount}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>

      {showSignInPrompt && (
        <SignInPrompt
          message="Nice work! Sign in to save your progress and see all your completed BeanGos"
          onDismiss={() => setShowSignInPrompt(false)}
          suppressAfterDismiss={true}
        />
      )}
    </div>
  );
}
