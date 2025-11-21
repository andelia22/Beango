import StatsPage from '../StatsPage';

export default function StatsPageExample() {
  const participants = [
    { id: "1", name: "Alex", tasksCompleted: 24 },
    { id: "2", name: "Maria", tasksCompleted: 22 },
    { id: "3", name: "James", tasksCompleted: 18 },
    { id: "4", name: "Sofia", tasksCompleted: 15 },
  ];

  return (
    <StatsPage
      roomCode="ABC-123"
      cityName="Caracas"
      participants={participants}
      totalTasks={24}
      onBackToHome={() => console.log("Back to home")}
    />
  );
}
