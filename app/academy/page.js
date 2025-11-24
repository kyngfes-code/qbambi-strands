import AcadamyPageCard from "@/components/AcadamyPageCard";
import { CheckCheckIcon } from "lucide-react";

function page() {
  return (
    <div className="grid grid-cols-[1fr_2fr_1fr] gap-4 mx-4">
      <section className="mt-2 pl-16 pt-8">
        <h1 className="font-semibold text-lg text-[#2a2a2a]">Qbambi Academy</h1>
        <p className="text-gray-600">
          Learn professional hair and beauty skills…
        </p>
        <span className="text-[#b48a5a]">Enroll Now</span>
        <ul>
          <li className="flex items-center gap-2 text-white font-semibold text-lg drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)]">
            <CheckCheckIcon className="w-4 h-4 text-white" />
            Installation
          </li>
          <li className="flex items-center gap-2 text-white font-semibold text-lg drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)]">
            <CheckCheckIcon className="w-4 h-4 text-white" />
            Braids
          </li>
          <li className="flex items-center gap-2 text-white font-semibold text-lg drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)]">
            <CheckCheckIcon className="w-4 h-4 text-white" />
            Packing gel
          </li>
          <li className="flex items-center gap-2 text-white font-semibold text-lg drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)]">
            <CheckCheckIcon className="w-4 h-4 text-white" />
            Wigging
          </li>
          <li className="flex items-center gap-2 text-white font-semibold text-lg drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)]">
            <CheckCheckIcon className="w-4 h-4 text-white" />
            Ventilating
          </li>
          <li className="flex items-center gap-2 text-white font-semibold text-lg drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)]">
            <CheckCheckIcon className="w-4 h-4 text-white" />
            Re-vamping
          </li>
        </ul>
      </section>
      <section className="flex flex-col mt-6">
        <div className="p-4 font-semibold text-lg text-[#2a2a2a]">
          <h1>Inside Our Academy</h1>
        </div>
        <AcadamyPageCard />
      </section>
      <section className="mt-4">
        <h1>Our students reviews</h1>
      </section>
    </div>
  );
}

export default page;
