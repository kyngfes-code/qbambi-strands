import Image from "next/image";
import bg from "@/public/saloon-bg.png";

function layout({ children }) {
  return (
    <div className="min-h-screen relative flex flex-col bg-linear-to-bl from-violet-100 to-stone-500">
      <div className="container mx-auto">
        <Image
          src={bg}
          fill
          placeholder="blur"
          className="absolute inset-0 w-full h-full object-cover sm:object-cover md:object-top lg:object-center opacity-70 transition-all duration-700 ease-in-out object-[left_80%] z-40"
          alt="Qbambi strands"
        />
        {children}
      </div>
      ;
    </div>
  );
}

export default layout;
