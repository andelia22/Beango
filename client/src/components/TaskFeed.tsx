import { useState, useEffect } from "react";
import TaskCard, { type TaskStatus } from "./TaskCard";
import SubmitButton from "./SubmitButton";
import RoomHeader from "./RoomHeader";
import { getCurrentUser, updateParticipantProgress } from "@/lib/roomStore";

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
}

export default function TaskFeed({ cityName, roomCode, tasks, onSubmit }: TaskFeedProps) {
  const userId = getCurrentUser();
  const storageKey = `beango_tasks_${roomCode}_${userId}`;
  
  const loadTaskStatuses = (): Record<number, TaskStatus> => {
    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
    return tasks.reduce((acc, task) => ({ ...acc, [task.id]: "incomplete" as TaskStatus }), {});
  };
  
  const [taskStatuses, setTaskStatuses] = useState<Record<number, TaskStatus>>(loadTaskStatuses);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    sessionStorage.setItem(storageKey, JSON.stringify(taskStatuses));
    
    const completedCount = Object.values(taskStatuses).filter(
      (status) => status !== "incomplete"
    ).length;
    
    updateParticipantProgress(roomCode, userId, completedCount);
  }, [taskStatuses, roomCode, userId, storageKey]);

  const handleTaskToggle = (taskId: number) => {
    setTaskStatuses((prev) => ({
      ...prev,
      [taskId]: prev[taskId] === "completed-by-me" ? "incomplete" : "completed-by-me",
    }));
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
    </div>
  );
}
