import RoomCodeDisplay from '../RoomCodeDisplay';

export default function RoomCodeDisplayExample() {
  return (
    <RoomCodeDisplay
      roomCode="XYZ-789"
      cityName="Caracas"
      onContinue={() => console.log("Starting hunt!")}
      onBack={() => console.log("Back clicked")}
    />
  );
}
