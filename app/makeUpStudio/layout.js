import Image from "next/image";
import bgImage from "@/public/bg-make-up1.png";
import NavBarMakeUpStudio from "@/components/NavBarMakeUpStudio";
import { CheckCheckIcon } from "lucide-react";
import BookButton from "@/components/BookButton";

export default function Layout({ children }) {
  return (
    <div className="h-screen items-center overflow-hidden bg-linear-to-r from-black via-[#521f3d] to-[#521f3d] relative flex flex-col">
      <NavBarMakeUpStudio />
      <BookButton />

      <div className="flex flex-1 h-[65%] px-6 justify-between items-center relative z-10">
        <div className="text-white mb-65 max-w-sm">
          <h2 className="text-3xl mb-4 font-semibold">Our Services</h2>

          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <CheckCheckIcon className="w-4 h-4 text-pink-300" />
              Bridal make-up
            </li>
            <li className="flex items-center gap-2">
              <CheckCheckIcon className="w-4 h-4 text-pink-300" />
              Birthday & other events make-up
            </li>
            <li className="flex items-center gap-2">
              <CheckCheckIcon className="w-4 h-4 text-pink-300" />
              Movie set make-up
            </li>
            <li className="flex items-center gap-2">
              <CheckCheckIcon className="w-4 h-4 text-pink-300" />
              Home service
            </li>
          </ul>
        </div>

        <Image
          src={bgImage}
          alt="make-up image"
          className="object-cover z-10 object-center h-full w-full"
        />
      </div>

      <div className="absolute bottom-0 left-0 w-full flex justify-center px-4 z-30 -mb-4">
        {children}
      </div>
    </div>
  );
}
