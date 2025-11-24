import { getAcademyData } from "@/lib/data-service";
import Image from "next/image";

async function AcadamyPageCard() {
  const data = await getAcademyData();

  return (
    <div className="grid grid-cols-2 gap-4 max-w-[1400px]">
      {data.map((item) => (
        <div
          key={item.id}
          className="relative backdrop-blur-md bg-white/20 border border-white/30
            rounded-2xl p-2 shadow-xl transition-all duration-300
            hover:bg-white/30 hover:scale-[1.03] h-52 overflow-hidden"
        >
          <Image
            src={item.images}
            alt="Academy"
            fill
            className="object-cover rounded-xl opacity-90 hover:opacity-100 transition"
            draggable={false}
          />
          <span className="absolute top-3 left-3 bg-gradient-to-r from-black/60 to-black/10 text-white text-sm px-3 py-2 rounded-full z-10">
            {item.description}
          </span>
        </div>
      ))}
    </div>
  );
}

export default AcadamyPageCard;
