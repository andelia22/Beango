import TaskFeed from '../TaskFeed';
import plazaImage from '@assets/generated_images/plaza_bolivar_colonial_buildings.png';
import arepaImage from '@assets/generated_images/venezuelan_arepa_food_photo.png';
import streetArtImage from '@assets/generated_images/caracas_street_art_mural.png';
import avilaImage from '@assets/generated_images/avila_mountain_cable_car.png';
import cachapaImage from '@assets/generated_images/venezuelan_cachapa_breakfast.png';
import cathedralImage from '@assets/generated_images/caracas_cathedral_exterior.png';

export default function TaskFeedExample() {
  const tasks = [
    {
      id: 1,
      imageUrl: plazaImage,
      caption: "Visit the historic Plaza Bolivar and take a photo with the statue"
    },
    {
      id: 2,
      imageUrl: arepaImage,
      caption: "Try an authentic Venezuelan arepa at a local restaurant"
    },
    {
      id: 3,
      imageUrl: streetArtImage,
      caption: "Find and photograph a colorful street art mural"
    },
    {
      id: 4,
      imageUrl: avilaImage,
      caption: "Take the cable car up to Avila mountain and enjoy the view"
    },
    {
      id: 5,
      imageUrl: cachapaImage,
      caption: "Have breakfast with a traditional cachapa"
    },
    {
      id: 6,
      imageUrl: cathedralImage,
      caption: "Visit the historic Caracas Cathedral"
    }
  ];

  return <TaskFeed cityName="Caracas" roomCode="ABC-123" tasks={tasks} onSubmit={() => console.log("Hunt submitted!")} />;
}
