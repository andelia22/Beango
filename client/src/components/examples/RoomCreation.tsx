import RoomCreation from '../RoomCreation';

export default function RoomCreationExample() {
  return (
    <RoomCreation
      onCreateRoom={(city) => console.log("Creating room for:", city)}
    />
  );
}
