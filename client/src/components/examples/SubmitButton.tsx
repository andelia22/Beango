import { useState } from "react";
import SubmitButton from '../SubmitButton';

export default function SubmitButtonExample() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <SubmitButton
        totalTasks={24}
        completedTasks={24}
        onSubmit={() => {
          console.log("Submitting scavenger hunt!");
          setIsSubmitting(true);
          setTimeout(() => setIsSubmitting(false), 2000);
        }}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
