import { useRoute } from "wouter";
import TaskFeed from "@/components/TaskFeed";
import plazaImage from '@assets/generated_images/plaza_bolivar_colonial_buildings.png';
import arepaImage from '@assets/generated_images/venezuelan_arepa_food_photo.png';
import streetArtImage from '@assets/generated_images/caracas_street_art_mural.png';
import avilaImage from '@assets/generated_images/avila_mountain_cable_car.png';
import cachapaImage from '@assets/generated_images/venezuelan_cachapa_breakfast.png';
import cathedralImage from '@assets/generated_images/caracas_cathedral_exterior.png';
import marketImage from '@assets/generated_images/venezuelan_market_produce_stall.png';
import parqueCentralImage from '@assets/generated_images/parque_central_towers.png';
import pabellonImage from '@assets/generated_images/pabellon_criollo_traditional_dish.png';
import metroImage from '@assets/generated_images/caracas_metro_station.png';
import tequenosImage from '@assets/generated_images/tequeños_cheese_sticks.png';
import theaterImage from '@assets/generated_images/teresa_carreno_theater.png';
import botanicalImage from '@assets/generated_images/botanical_garden_greenery.png';
import quesilloImage from '@assets/generated_images/quesillo_flan_dessert.png';
import colonialImage from '@assets/generated_images/colonial_house_facade.png';
import museumImage from '@assets/generated_images/fine_arts_museum_building.png';
import empanadaImage from '@assets/generated_images/venezuelan_empanada_close-up.png';
import parqueEsteImage from '@assets/generated_images/parque_del_este_lake.png';
import cuatroImage from '@assets/generated_images/cuatro_venezuelan_instrument.png';
import panteonImage from '@assets/generated_images/panteon_nacional_monument.png';
import handicraftImage from '@assets/generated_images/handicraft_market_stall.png';
import nightSkylineImage from '@assets/generated_images/caracas_night_skyline.png';
import chichaImage from '@assets/generated_images/chicha_traditional_drink.png';
import performerImage from '@assets/generated_images/street_performer_scene.png';

export default function Hunt() {
  const [, params] = useRoute("/hunt/:code");
  const roomCode = params?.code || "DEMO-123";

  const tasks = [
    { id: 1, imageUrl: plazaImage, caption: "Visit the historic Plaza Bolivar and take a photo with the statue" },
    { id: 2, imageUrl: arepaImage, caption: "Try an authentic Venezuelan arepa at a local restaurant" },
    { id: 3, imageUrl: streetArtImage, caption: "Find and photograph a colorful street art mural" },
    { id: 4, imageUrl: avilaImage, caption: "Take the cable car up to Avila mountain and enjoy the view" },
    { id: 5, imageUrl: cachapaImage, caption: "Have breakfast with a traditional cachapa" },
    { id: 6, imageUrl: cathedralImage, caption: "Visit the historic Caracas Cathedral" },
    { id: 7, imageUrl: marketImage, caption: "Explore a local market and try fresh tropical fruit" },
    { id: 8, imageUrl: parqueCentralImage, caption: "Take a photo at the iconic Parque Central towers" },
    { id: 9, imageUrl: pabellonImage, caption: "Enjoy a traditional pabellón criollo meal" },
    { id: 10, imageUrl: metroImage, caption: "Ride the Caracas metro system" },
    { id: 11, imageUrl: tequenosImage, caption: "Share tequeños with friends at a café" },
    { id: 12, imageUrl: theaterImage, caption: "Visit the Teresa Carreño Cultural Center" },
    { id: 13, imageUrl: botanicalImage, caption: "Take a peaceful walk through the Botanical Garden" },
    { id: 14, imageUrl: quesilloImage, caption: "Try the famous Venezuelan quesillo dessert" },
    { id: 15, imageUrl: colonialImage, caption: "Photograph a beautiful colonial house facade" },
    { id: 16, imageUrl: museumImage, caption: "Visit the Museum of Fine Arts" },
    { id: 17, imageUrl: empanadaImage, caption: "Grab a fresh empanada from a street vendor" },
    { id: 18, imageUrl: parqueEsteImage, caption: "Relax by the lake at Parque del Este" },
    { id: 19, imageUrl: cuatroImage, caption: "Find someone playing the traditional cuatro instrument" },
    { id: 20, imageUrl: panteonImage, caption: "Pay respects at the Panteón Nacional" },
    { id: 21, imageUrl: handicraftImage, caption: "Buy a handmade souvenir from a local artisan" },
    { id: 22, imageUrl: nightSkylineImage, caption: "Capture the Caracas skyline at night" },
    { id: 23, imageUrl: chichaImage, caption: "Try the traditional chicha beverage" },
    { id: 24, imageUrl: performerImage, caption: "Watch a street performer and leave a tip" },
  ];

  return (
    <TaskFeed
      cityName="Caracas"
      roomCode={roomCode}
      tasks={tasks}
    />
  );
}
