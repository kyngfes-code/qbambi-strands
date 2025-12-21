import { PhoneIcon, Search } from "lucide-react";
import Logo from "@/components/Logo";

import icon from "@/public/icon-flat-gold.png";
import Navigation from "./Navigation";

function NavBarMakeUpStudio() {
  return (
    <header className="sticky w-full top-0 z-50 flex items-center justify-between px-8 py-4 bg-black/20 border-none font-bold text-white backdrop-blur-md">
      <Logo
        height="50"
        width="50"
        src={icon}
        className="sm:hidden md:block md:text-sm text-white"
      />
      <Navigation className=" text-white text-sm" />

      <div className=" hidden md:px-2 md:flex md:items-center md:gap-2">
        <PhoneIcon className="w-4 h-4" />
        <p className="text-sm font-medium text-white">Call us 07036308292</p>
      </div>
    </header>
  );
}

export default NavBarMakeUpStudio;
