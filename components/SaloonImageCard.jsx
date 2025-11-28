// OPTION A — Minimal Glass Strip
import { getSaloonData } from "@/lib/data-service";
import Image from "next/image";

export default async function SaloonImageCard() {
  const data = await getSaloonData();
  const images = data.slice(0, 4);

  return (
    <div className="h-40 w-full flex gap-2 px-2 backdrop-blur-sm bg-white/10 rounded-xl overflow-hidden">
      {images.map((img, index) => (
        <div key={index} className="relative flex-1 rounded-lg overflow-hidden">
          <Image
            src={img.images}
            alt="salon"
            fill
            className="object-cover opacity-90 hover:opacity-100 transition-all duration-300"
          />
        </div>
      ))}
    </div>
  );
}
