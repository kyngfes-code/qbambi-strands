import NavBar from "@/components/NavBar";
import Image from "next/image";
import bg1 from "@/public/bg1.jpg";
import HomePageCard from "@/components/HomePageCard";

export default function Home() {
  return (
    <div className="min-h-screen relative flex flex-col bg-linear-to-bl from-violet-100 to-stone-500">
      <div className="container mx-auto">
        <Image
          src={bg1}
          fill
          placeholder="blur"
          className="absolute inset-0 w-full h-full object-cover sm:object-cover md:object-top lg:object-center opacity-70 transition-all duration-700 ease-in-out object-[left_80%] z-40"
          alt="Qbambi strands"
        />
      </div>
      <NavBar />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] relative z-40">
        <HomePageCard />
      </div>
    </div>
  );
}
