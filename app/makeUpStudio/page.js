import MakeUpImagesCard from "@/components/MakeUpImagesCard";
import { getMakeUpImages } from "@/lib/data-service";

async function page() {
  const images = await getMakeUpImages();
  return (
    <div>
      <MakeUpImagesCard images={images} />
    </div>
  );
}

export default page;
