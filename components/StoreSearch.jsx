"use client";

import { SearchIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function StoreSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") || "");

  useEffect(() => {
    const delay = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (search.trim()) {
        params.set("q", search.trim());
      } else {
        params.delete("q");
      }

      router.push(`/store?${params.toString()}`);
    }, 300); // debounce

    return () => clearTimeout(delay);
  }, [search]);

  return (
    <div className="w-[220px] md:w-[350px] lg:w-[420px]">
      <div className="flex items-center gap-2 rounded-lg px-4 py-2 bg-white">
        <SearchIcon className="w-5 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search by name, style, material..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full focus:outline-none px-2"
        />
      </div>
    </div>
  );
}
