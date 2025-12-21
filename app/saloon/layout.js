import Image from "next/image";
import bg from "@/public/bg-saloon1.png";

function layout({ children }) {
  return (
    <div className="min-h-screen relative flex flex-col bg-gradient-to-br from-[#7a002f] via-[#e5b39c] to-[#0a0a0a]">
      <Image
        src={bg}
        fill
        placeholder="blur"
        alt="Qbambi strands"
        className="absolute inset-0 w-full h-full object-contain opacity-50 transition-all duration-700 ease-in-out  xl:translate-x-130 z-0"
      />
      <div className="relative z-50 container mx-auto ">{children}</div>
    </div>
  );
}

export default layout;
