import {
  getHomePageImagesAcademy,
  getHomePageImagesHairs,
  getHomePageImagesMakeup,
  getHomePageImagesSaloon,
  getMakeUpImages,
} from "@/lib/data-service";
import Image from "next/image";
import Link from "next/link";

export default async function HomePageCard() {
  const images = await getMakeUpImages();
  const academyImageData = await getHomePageImagesAcademy();
  const academyImage = academyImageData[0]?.images || null;
  const saloonImageData = await getHomePageImagesSaloon();
  const saloonImages = saloonImageData.slice(0, 4);
  const makeupImageData = await getHomePageImagesMakeup();
  const makeupImages = makeupImageData.slice(0, 4);
  const hairImageData = await getHomePageImagesHairs();
  const hairImages = hairImageData.slice(0, 4);

  return (
    <div className="w-full flex justify-center mt-6">
      <div className="grid grid-cols-4 gap-6 w-full max-w-6xl">
        {/* CARD 1 – MAKEUP */}
        <div
          className="backdrop-blur-md bg-white/20 border border-white/30
        rounded-2xl p-2 shadow-xl transition-all duration-300
        hover:bg-white/30 hover:scale-[1.02] h-52"
        >
          <div className="grid grid-cols-2 gap-2 h-full">
            {makeupImages.map((img, index) => (
              <div
                className="relative w-full h-full rounded-lg overflow-hidden"
                key={index}
              >
                <Image
                  src={img.images}
                  alt="makeup"
                  fill
                  className="object-cover object-top opacity-90 hover:opacity-100 transition"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* CARD 2 – HAIR */}
        <div
          className="backdrop-blur-md bg-white/20 border border-white/30
        rounded-2xl p-2 shadow-xl transition-all duration-300
        hover:bg-white/30 hover:scale-[1.02] h-52"
        >
          <div className="grid grid-cols-2 gap-2 h-full">
            {hairImages.map((img, index) => (
              <div
                className="relative w-full h-full rounded-lg overflow-hidden"
                key={index}
              >
                <Image
                  src={img.images}
                  alt="hair"
                  fill
                  className="object-cover opacity-90 hover:opacity-100 transition"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* CARD 3 – SALOON */}
        <Link
          href="/saloon"
          className="backdrop-blur-md bg-white/20 border border-white/30
        rounded-2xl p-2 shadow-xl transition-all duration-300
        hover:bg-white/30 hover:scale-[1.03] h-52 block"
        >
          <div className="grid grid-cols-2 gap-2 h-full">
            {saloonImages.map((img, index) => (
              <div
                className="relative w-full h-full rounded-lg overflow-hidden"
                key={index}
              >
                <Image
                  src={img.images}
                  alt="saloon"
                  fill
                  className="object-cover opacity-90 hover:opacity-100 transition"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </Link>

        {/* CARD 4 – ACADEMY */}
        <Link
          href="/academy"
          className="relative backdrop-blur-md bg-white/20 border border-white/30
        rounded-2xl p-2 shadow-xl transition-all duration-300
        hover:bg-white/30 hover:scale-[1.03] h-52 block"
        >
          <Image
            src={academyImage}
            alt="Academy"
            fill
            className="object-cover opacity-90 hover:opacity-100 transition rounded-xl"
            draggable={false}
          />

          <span className="absolute top-3 left-3 bg-black/40 text-white text-sm px-3 py-1 rounded-full animate-pulse z-10">
            Visit Academy
          </span>
        </Link>
      </div>
    </div>
  );
}
