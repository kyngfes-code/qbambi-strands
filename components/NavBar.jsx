"use client";

import { Search } from "lucide-react";
import Logo from "./Logo";
import Navigation from "./Navigation";
import { Button } from "./ui/button";

function NavBar() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between mx-2 pt-4 pb-4 border-b bg-transparent backdrop-blur-sm font-bold border-stone-400">
      <Logo />
      <Navigation />
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
