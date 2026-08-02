"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export default function PaymentSearch({
  value,
  onChange,
  placeholder = "Search student, enrollment number or payment reference...",
}) {
  return (
    <div className="relative w-full md:max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10"
      />
    </div>
  );
}
