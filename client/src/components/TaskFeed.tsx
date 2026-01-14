import { useState, useEffect, useRef } from "react";
import TaskCard, { type TaskStatus } from "./TaskCard";
import SubmitButton from "./SubmitButton";
import RoomHeader from "./RoomHeader";
import { SignInPrompt } from "./SignInPrompt";
import { useAuth } from "@/hooks/useAuth";
import { toggleTaskCompletion } from "@/lib/anonymousStorage";

interface Task {
  id: number;
  imageUrl: string;
  caption: string;
}

interface TaskFeedProps {
  cityName: string;
  roomCode: string;
  tasks: Task[];
  onSubmit: () => void;
  onProgressUpdate?: (completedIds: number[]) => void;
  initialCompletedIds?: number[];
}

export default function TaskFeed({ cityName, roomCode, tasks, onSubmit, onProgressUpdate, initialCompletedIds = [] }: TaskFeedProps) {
  const { isAuthenticated } = useAuth();
  
  const buildInitialStatuses = (): Record<number, TaskStatus> => {
    const statuses: Record<number, TaskStatus> = {};
    for (const task of tasks) {
      statuses[task.id] = initialCompletedIds.includes(task.id) ? "completed-by-me" : "incomplete";
    }
    return statuses;
  };
  
  const [taskStatuses, setTaskStatuses] = useState<Record<number, TaskStatus>>(buildInitialStatuses);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [hasShownPromptThisSession, setHasShownPromptThisSession] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    const completedIds = Object.entries(taskStatuses)
      .filter(([_, status]) => status !== "incomplete")
      .map(([id]) => parseInt(id, 10));
    
    onProgressUpdate?.(completedIds);
  }, [taskStatuses]);

  const handleTaskToggle = (taskId: number) => {
    const newStatus = taskStatuses[taskId] === "completed-by-me" ? "incomplete" : "completed-by-me";
    
    setTaskStatuses((prev) => ({
      ...prev,
      [taskId]: newStatus,
    }));

    if (!isAuthenticated) {
      toggleTaskCompletion(roomCode, taskId.toString(), newStatus === "completed-by-me");
      
      if (newStatus === "completed-by-me" && !hasShownPromptThisSession) {
        setShowSignInPrompt(true);
        setHasShownPromptThisSession(true);
      }
    }
  };

  const handleSubmit = () => {
    console.log("Submitting scavenger hunt!");
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit();
    }, 2000);
  };

  const completedCount = Object.values(taskStatuses).filter(
    (status) => status !== "incomplete"
  ).length;

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
            status={taskStatuses[task.id]}
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
