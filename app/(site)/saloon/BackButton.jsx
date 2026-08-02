"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="
    fixed
    top-5
    left-5
    z-50
    flex
    items-center
    gap-2
    rounded-full
    border
    border-[#C6A667]/40
    bg-black/60
    backdrop-blur-md
    px-4
    py-2
    text-sm
    font-medium
    text-white
    transition-all
    hover:border-[#C6A667]
    hover:bg-[#C6A667]
    hover:text-black
  "
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );
}
