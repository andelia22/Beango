import { useState } from "react";
import TaskCard, { type TaskStatus } from "./TaskCard";
import SubmitButton from "./SubmitButton";
import RoomHeader from "./RoomHeader";

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
  const [taskStatuses, setTaskStatuses] = useState<Record<number, TaskStatus>>(
    tasks.reduce((acc, task) => ({ ...acc, [task.id]: "incomplete" as TaskStatus }), {})
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTaskComplete = (taskId: number) => {
    setTaskStatuses((prev) => ({
      ...prev,
      [taskId]: "completed-by-me",
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
            onComplete={() => handleTaskComplete(task.id)}
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
