import RoomJoin from '../RoomJoin';

export default function RoomJoinExample() {
  return (
    <RoomJoin
      onJoinRoom={(code) => console.log("Joining room:", code)}
      onCreateInstead={() => console.log("Creating room instead")}
    />
  );
}
