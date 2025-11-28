import ImageFetcher from "@/components/ImageFetcher";
import {
  getHomePageImagesAcademy,
  getHomePageImagesHairs,
  getHomePageImagesMakeup,
  getHomePageImagesSaloon,
} from "@/lib/data-service";
import Image from "next/image";
import Link from "next/link";

async function page() {
  const [saloonImages, academyImage, makeupImages, hairImages] =
    await ImageFetcher();

  return (
    <div className="p-8 flex flex-col items-center">
      <h1>Home Page Image Editor</h1>
      <div className="w-full flex justify-center mt-6">
        <div className="grid grid-cols-4 gap-6 w-full max-w-6xl">
          <div
            className="backdrop-blur-md bg-white/20 border border-white/30
              rounded-2xl p-2 shadow-xl transition-all duration-300
              hover:bg-white/30 hover:scale-[1.02] h-52"
          >
            <div className="grid grid-cols-2 gap-2 h-full">
              {makeupImages.map((item) => (
                <Link
                  href={`/admin/${item.id}`}
                  className="relative w-full h-full rounded-lg overflow-hidden"
                  key={item.id}
                >
                  <Image
                    src={item.images}
                    alt="makeup"
                    fill
                    className="object-cover object-top opacity-90 hover:opacity-100 transition"
                    draggable={false}
                  />
                </Link>
              ))}
            </div>
          </div>

          <div
            className="backdrop-blur-md bg-white/20 border border-white/30
              rounded-2xl p-2 shadow-xl transition-all duration-300
              hover:bg-white/30 hover:scale-[1.02] h-52"
          >
            <div className="grid grid-cols-2 gap-2 h-full">
              {hairImages.map((item) => (
                <Link
                  href={`/admin/${item.id}`}
                  className="relative w-full h-full rounded-lg overflow-hidden"
                  key={item.id}
                >
                  <Image
                    src={item.images}
                    alt="hair"
                    fill
                    className="object-cover opacity-90 hover:opacity-100 transition"
                    draggable={false}
                  />
                </Link>
              ))}
            </div>
          </div>

          <div className=" flex flex-col backdrop-blur-md bg-white/20 border border-white/30 rounded-2xl p-2 shadow-xl transition-all duration-300 hover:bg-white/30 hover:scale-[1.03] h-52">
            <h2>Click to change image</h2>
            <div className="grid grid-cols-2 gap-2 h-full">
              {saloonImages.map((item) => (
                <Link
                  href={`/admin/${item.id}`}
                  className="relative w-full h-full rounded-lg overflow-hidden"
                  key={item.id}
                >
                  <Image
                    src={item.images}
                    alt="saloon"
                    fill
                    className="object-cover opacity-90 hover:opacity-100 transition"
                    draggable={false}
                  />
                </Link>
              ))}
            </div>
          </div>

          <div>
            {academyImage.map((item) => (
              <div key={item.id}>
                <Link
                  href={`/admin/${item.id}`}
                  className="relative backdrop-blur-md bg-white/20 border border-white/30
                  rounded-2xl p-2 shadow-xl transition-all duration-300
                  hover:bg-white/30 hover:scale-[1.03] w-80 h-60 block"
                >
                  <h2>Click to change image</h2>
                  <Image
                    src={item.images}
                    alt="Academy"
                    fill
                    className="object-cover opacity-90 hover:opacity-100 transition rounded-xl"
                    draggable={false}
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;
