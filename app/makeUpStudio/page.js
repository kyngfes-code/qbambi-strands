import MakeUpImagesCard from "@/components/MakeUpImagesCard";
import { getMakeUpImages } from "@/lib/data-service";

async function page() {
  const images = await getMakeUpImages();
  return (
    <div className="flex overflow-x-hidden">
      <MakeUpImagesCard images={images} />
    </div>
  );
}

export default page;
