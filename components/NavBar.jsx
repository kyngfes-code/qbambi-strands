"use client";

import { Search } from "lucide-react";
import Logo from "./Logo";
import Navigation from "./Navigation";
import { Button } from "./ui/button";
import icon from "@/public/icon-flat-gold.png";
import SignInDropdownButton from "./SignInDropDownButton";

function NavBar({ className = "" }) {
  return (
    <header
      className={`sticky top-0 z-50 flex items-center justify-between mx-2 py-2 border-b bg-transparent backdrop-blur-sm font-bold border-stone-400 ${className} `}
    >
      <Logo
        height="40"
        width="40"
        src={icon}
        className="lg:block text-white text-xs "
      />
      <Navigation className=" text-white text-sm " />

      <div className="px-2">
        <SignInDropdownButton />
      </div>
    </header>
  );
}

export default NavBar;
