"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 rounded-full border border-[#f1d9e3] bg-white px-4 py-2 font-medium text-neutral-700 transition hover:border-[#B33863] hover:text-[#B33863]"
    >
      <ChevronLeft className="h-4 w-4" />
      Back
    </button>
  );
}
