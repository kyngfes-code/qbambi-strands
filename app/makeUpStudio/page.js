import MakeUpImagesCard from "@/components/MakeUpImagesCard";
import SpinnerMini from "@/components/SpinnerMini";
import { getMakeUpImages } from "@/lib/data-service";

export const metadata = {
  title: "Make-up Studio",
};

async function page() {
  const images = await getMakeUpImages();
  return (
    <div className="flex overflow-x-hidden">
      <MakeUpImagesCard images={images} />
    </div>
  );
}

export default page;
