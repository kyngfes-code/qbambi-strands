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
    <div className="w-full flex flex-col items-center mt-6">
      {/* TOP TWO CARDS */}
      <div className="grid grid-cols-2 gap-6 w-max-w-5xl">
        {/* LEFT CARD */}
        <div
          className="backdrop-blur-md bg-white/20 border border-white/30
                        rounded-2xl p-2 shadow-xl transition-all duration-300
                        hover:bg-white/30 hover:scale-[1.02]"
        >
          <div className="grid grid-cols-2 gap-2">
            {makeupImages.map((img, index) => (
              <div
                className="relative w-full h-24 rounded-lg overflow-hidden"
                key={index}
              >
                <span className="absolute top-2 left-2 bg-white/40 text-black text-sm font-bold px-2 py-1 rounded-full animate-pulse">
                  Click me
                </span>
                <Image
                  src={img.images}
                  alt="make up image"
                  fill
                  className="object-cover object-top translate-y-0.5 opacity-90 hover:opacity-100 transition"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT CARD */}
        <div
          className="backdrop-blur-md bg-white/20 border border-white/30
                        rounded-2xl p-2 shadow-xl transition-all duration-300
                        hover:bg-white/30 hover:scale-[1.02]"
        >
          <div className="grid grid-cols-2 gap-2">
            {hairImages.map((img, index) => (
              <div
                className="relative w-full h-24 rounded-lg overflow-hidden"
                key={index}
              >
                <button className="mt-4 px-6 py-3 rounded-full bg-black/70 text-white hover:bg-black">
                  Shop Wigs Now
                </button>
                <Image
                  src={img.images}
                  alt="make up image"
                  fill
                  className="object-cover opacity-90 hover:opacity-100 transition"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ACADEMY FEATURE CARD AND SALOON */}
      <div className="grid grid-cols-2 gap-6 w-[80vw] pt-4 max-w-5xl">
        <div>
          <Link
            href="/saloon"
            className="block backdrop-blur-md bg-white/20 border border-white/30
          rounded-2xl p-4 shadow-2xl transition-all duration-300
          hover:bg-white/30 hover:scale-[1.03]"
          >
            <div className="relative w-full h-60 rounded-lg overflow-hidden">
              <span className="absolute top-3 left-3 bg-black/45 text-white text-sm px-3 py-1 rounded-full animate-pulse">
                Visit Qbambi’s Saloon
              </span>

              <div className="grid grid-cols-2 gap-2">
                {saloonImages.map((img, index) => (
                  <div
                    className="relative w-full h-30 rounded-lg overflow-hidden"
                    key={index}
                  >
                    <Image
                      src={img.images}
                      alt="make up image"
                      fill
                      className="object-cover opacity-90 hover:opacity-100 transition"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-2">
              <button className="px-6 py-2 text-white bg-black/70 rounded-full hover:bg-black transition">
                Visit And Book A Session With Our Saloon →
              </button>
            </div>
          </Link>
        </div>
        <div>
          <Link
            href="/academy"
            className="block backdrop-blur-md bg-white/20 border border-white/30
          rounded-2xl p-4 shadow-2xl transition-all duration-300
          hover:bg-white/30 hover:scale-[1.03]"
          >
            <div className="relative w-full h-60 rounded-lg overflow-hidden">
              <span className="absolute top-3 left-3 bg-black/45 text-white text-sm px-3 py-1 rounded-full animate-pulse">
                Visit Qbambi’s Academy
              </span>

              <Image
                src={academyImage}
                alt="Students training at Qbambi Academy"
                fill
                className="object-cover opacity-90 hover:opacity-100 transition"
                draggable={false}
              />
            </div>

            <div className="text-center mt-2">
              <button className="px-6 py-2 text-white bg-black/70 rounded-full hover:bg-black transition">
                Explore Academy →
              </button>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
