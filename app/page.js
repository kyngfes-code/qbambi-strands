import NavBar from "@/components/NavBar";
import Image from "next/image";
import bg1 from "@/public/bg1.jpg";
import HomePageCard from "@/components/HomePageCard";
import HeroSection from "@/components/HeroSection";
import { Suspense } from "react";
import SpinnerMini from "@/components/SpinnerMini";

export default function Home({ searchParams }) {
  return (
    <div className="min-h-screen relative overflow-x-hidden overflow-y-auto bg-linear-to-bl from-violet-100 to-stone-500">
      <Image
        src={bg1}
        fill
        placeholder="blur"
        className="absolute inset-0 w-full h-full object-center object-cover  md:object-[left_80%]  lg:object-center  xl:object-[left_80%]  opacity-80 transition-all duration-700 ease-in-out  z-10 pointer-events-none"
        alt="Qbambi strands"
      />

      <NavBar />
      <HeroSection />
      <Suspense fallback={<SpinnerMini />}>
        <div className="relative z-50 flex justify-center -translate-y-20">
          <HomePageCard />
        </div>
      </Suspense>
    </div>
  );
}
