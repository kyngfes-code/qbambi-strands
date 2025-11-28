import NavBar from "@/components/NavBar";
import bgImage from "@/public/academy-bg2.jpg";
import Image from "next/image";

function layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#d9c8b4] to-[#e7e7e7]">
      <NavBar className="border-b-[#605106]!" />

      <main>{children}</main>
    </div>
  );
}

export default layout;
