import { useState } from "react";
import TaskCard from '../TaskCard';
import plazaImage from '@assets/generated_images/plaza_bolivar_colonial_buildings.png';

export default function TaskCardExample() {
  const [status, setStatus] = useState<"incomplete" | "completed-by-me" | "completed-by-friend">("incomplete");

  return (
    <div className="max-w-2xl mx-auto p-4">
      <TaskCard
        taskNumber={1}
        imageUrl={plazaImage}
        caption="Visit the historic Plaza Bolivar and take a photo with the statue"
        status={status}
        completedBy="Maria"
        onToggle={() => {
          console.log("Task toggled!");
          setStatus(status === "completed-by-me" ? "incomplete" : "completed-by-me");
        }}
      />
    </div>
  );
}
