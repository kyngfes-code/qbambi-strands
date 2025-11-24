"use client";

import { Search } from "lucide-react";
import Logo from "./Logo";
import Navigation from "./Navigation";
import { Button } from "./ui/button";
import icon from "@/public/icon-flat-gold.png";

function NavBar() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between mx-2 py-2 border-b bg-transparent backdrop-blur-sm font-bold border-stone-400">
      <Logo
        height="40"
        width="40"
        src={icon}
        className="lg:block text-white text-xs "
      />
      <Navigation className=" text-white text-sm " />
      <div className="flex flex-col sm:hidden md:flex-row  gap-4 p-4 border rounded">
        <Search />
        <p className="hidden sm:block">Search</p>
      </div>
      <div className="px-2">
        <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
          Sign In
        </Button>
      </div>
    </header>
  );
}

export default NavBar;
