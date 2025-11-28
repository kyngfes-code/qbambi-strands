import { getMakeUpImages } from "@/lib/data-service";
import Image from "next/image";
import Link from "next/link";

async function Page() {
  const images = await getMakeUpImages();

  return (
    <div className="relative w-full mt-4 animate-slideIn">
      <div className="px-4">
        <div className="flex flex-wrap gap-6 justify-center">
          {images.map((item) => (
            <Link
              href={`/admin/make-up-studio/${item.id}`}
              key={item.id}
              className="w-[250px] sm:w-64 border rounded-3xl p-3 
                     shadow-md transition hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="relative w-full h-64 rounded-xl overflow-hidden">
                <Image
                  src={item.images}
                  alt="make-up image"
                  fill
                  className="object-cover"
                />
              </div>
            </Link>
          ))}

          <div
            className="w-[250px] sm:w-64 border rounded-3xl p-3 
                   shadow-md transition hover:-translate-y-2 hover:shadow-xl"
          >
            <div className="relative w-full h-64 rounded-xl flex items-center justify-center text-4xl">
              +
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
