"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export default function EnrollmentSearch({
  value,
  onChange,
  placeholder = "Search by name, email or phone...",
}) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 pl-11"
      />
    </div>
  );
}
