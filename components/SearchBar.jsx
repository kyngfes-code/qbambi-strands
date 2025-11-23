import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="w-[220px] md:w-[350px] lg:w-[420px]">
      <div className="flex items-center gap-2 border-none  rounded-lg px-4 py-2 bg-white">
        <Search className="w-5 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search products ........"
          className="w-full focus:outline-none focus:ring-0 focus:border-none px-2"
        />
      </div>
    </div>
  );
}
