import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import TaskCard, { type TaskStatus } from "./TaskCard";
import SubmitButton from "./SubmitButton";
import RoomHeader from "./RoomHeader";
import { SignInPrompt } from "./SignInPrompt";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getDeviceId } from "@/lib/deviceId";

interface Task {
  id: number;
  imageUrl: string;
  caption: string;
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
  const deviceId = getDeviceId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [hasShownPromptThisSession, setHasShownPromptThisSession] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<number | null>(null);

  const { data: completions = [] } = useQuery<ChallengeCompletion[]>({
    queryKey: ["/api/rooms", roomCode, "completions"],
    queryFn: async () => {
      const response = await fetch(`/api/rooms/${roomCode}/completions`);
      if (!response.ok) return [];
      return response.json();
    },
    refetchInterval: 2000,
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
        isMe: c.completedByDeviceId === deviceId,
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

  const completedTaskIds = new Set(completions.map(c => c.challengeId));
  const completedCount = completedTaskIds.size;

  return (
    <div className="min-h-screen bg-background">
      <RoomHeader cityName={cityName} roomCode={roomCode} />
      
      <div className="max-w-2xl mx-auto px-4 py-6">
        {tasks.map((task) => (
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
          completedTasks={completedCount}
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
