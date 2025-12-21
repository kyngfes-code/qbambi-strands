import Logo from "./Logo";
import Navigation from "./Navigation";

import icon from "@/public/icon-flat-gold.png";

function NavBar({ className = "" }) {
  return (
    <header
      className={`sticky top-0 z-50 flex items-center justify-between mx-2 py-2 border-b bg-transparent  font-bold border-stone-400 ${className} `}
    >
      <Logo
        height="40"
        width="40"
        src={icon}
        className="lg:block text-white text-xs "
      />
      <Navigation className=" text-white text-sm " />
    </header>
  );
}

export default NavBar;
