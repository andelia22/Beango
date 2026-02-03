import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import PullToRefresh from "react-simple-pull-to-refresh";
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
  const refreshStepIndexRef = useRef<number>(0);

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

  const getTaskStatus = (taskId: number): TaskStatus => {
    const taskCompletions = completions.filter(c => c.challengeId === taskId);
    if (taskCompletions.length === 0) return "incomplete";
    
    const myCompletion = taskCompletions.find(
      c => c.completedByDeviceId === deviceId || c.completedByUserId === user?.id
    );
    const othersCompleted = taskCompletions.some(
      c => c.completedByDeviceId !== deviceId && c.completedByUserId !== user?.id
    );
    
    if (myCompletion && othersCompleted) return "completed-by-me-and-others";
    if (myCompletion) return "completed-by-me";
    return "completed-by-others";
  };

  const getCompletionsForTask = (taskId: number): CompletionInfo[] => {
    const taskCompletions = completions.filter(c => c.challengeId === taskId);
    return taskCompletions.map(c => ({
      name: c.completedByName,
      isMe: c.completedByDeviceId === deviceId || c.completedByUserId === user?.id,
    }));
  };

  const handleTaskToggle = async (taskId: number) => {
    if (addCompletionMutation.isPending || removeCompletionMutation.isPending) return;
    
    const currentStatus = getTaskStatus(taskId);
    
    if (currentStatus === "incomplete") {
      setPendingToggle(taskId);
      try {
        await addCompletionMutation.mutateAsync(taskId);
        
        if (!isAuthenticated && !hasShownPromptThisSession) {
          setTimeout(() => {
            setShowSignInPrompt(true);
            setHasShownPromptThisSession(true);
          }, 500);
        }
      } finally {
        setPendingToggle(null);
      }
    } else if (currentStatus === "completed-by-me" || currentStatus === "completed-by-me-and-others") {
      setPendingToggle(taskId);
      try {
        await removeCompletionMutation.mutateAsync(taskId);
      } finally {
        setPendingToggle(null);
      }
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit();
    }, 2000);
  };

  const incompleteInCurrentStep = activeStep?.challenges.filter(
    c => !globalCompletedChallengeIds.has(c.id)
  ) || [];
  const hasIncompleteChallenges = incompleteInCurrentStep.length > 0;

  const refreshMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/rooms/${roomCode}/refresh-challenges`, {});
    },
    onSuccess: async () => {
      // Preserve step position BEFORE query invalidation triggers re-renders
      setActiveStepIndex(refreshStepIndexRef.current);
      
      await queryClient.invalidateQueries({ queryKey: ["/api/rooms", roomCode] });
      await queryClient.invalidateQueries({ queryKey: ["/api/cities"] });
      toast({
        title: "Challenges refreshed",
        description: "Tasks shuffled within your room.",
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

  const handleRefresh = useCallback(async (): Promise<void> => {
    if (!hasIncompleteChallenges) {
      toast({
        title: "No challenges to refresh",
        description: "All challenges in this step are complete.",
        variant: "default",
      });
      return;
    }
    
    // Store current step in ref before mutation (accessible in onSuccess)
    refreshStepIndexRef.current = activeStepIndex;
    
    await refreshMutation.mutateAsync();
  }, [refreshMutation, toast, hasIncompleteChallenges, activeStepIndex]);

  const currentStepChallenges = activeStep?.challenges || [];
  const canGoBack = activeStepIndex > 0 && canNavigateToStep(activeStepIndex - 1);
  const canGoForward = activeStepIndex < steps.length - 1 && canNavigateToStep(activeStepIndex + 1);
  const isAllComplete = totalCompletedCount >= tasks.length;

  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      pullingContent={
        <div className="flex items-center justify-center py-4">
          <RefreshCw className="h-5 w-5 text-muted-foreground" />
        </div>
      }
      refreshingContent={
        <div className="flex items-center justify-center py-4">
          <RefreshCw className="h-5 w-5 text-primary animate-spin" />
        </div>
      }
    >
      <div className="min-h-screen bg-background">
        <RoomHeader cityName={cityName} roomCode={roomCode} />
        
        <StepNavigationBar
          steps={steps}
          activeStepIndex={activeStepIndex}
          onStepClick={setActiveStepIndex}
          canNavigateToStep={canNavigateToStep}
        />
        
        <div className="max-w-2xl mx-auto px-4 py-6">
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

          {hasIncompleteChallenges && !isAllComplete && (
            <div className="flex items-center justify-center mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshMutation.isPending}
                data-testid="button-refresh-step"
                aria-label="Swap incomplete challenges"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
                Swap {incompleteInCurrentStep.length} incomplete {incompleteInCurrentStep.length === 1 ? 'challenge' : 'challenges'}
              </Button>
            </div>
          )}

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
    </PullToRefresh>
  );
}
