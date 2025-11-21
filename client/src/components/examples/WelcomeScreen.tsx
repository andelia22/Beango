import WelcomeScreen from '../WelcomeScreen';

export default function WelcomeScreenExample() {
  return (
    <WelcomeScreen
      onCreateRoom={() => console.log("Create room clicked")}
      onJoinRoom={() => console.log("Join room clicked")}
    />
  );
}
