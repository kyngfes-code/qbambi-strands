"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CourseSearch({
  search = "",
  onSearchChange,
  status = "all",
  onStatusChange,
}) {
  function clearFilters() {
    onSearchChange("");
    onStatusChange("all");
  }

  const hasFilters = search || status !== "all";

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        {/* Search */}
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Search Courses
          </label>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by course title..."
              className="pl-11"
            />
          </div>
        </div>

        {/* Status */}
        <div className="w-full lg:w-56">
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Status
          </label>

          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full rounded-xl border px-4 py-3"
          >
            <option value="all">All Courses</option>

            <option value="active">Active</option>

            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Clear */}
        <div className="lg:pb-[1px]">
          <Button
            type="button"
            variant="outline"
            disabled={!hasFilters}
            onClick={clearFilters}
            className="w-full lg:w-auto"
          >
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
