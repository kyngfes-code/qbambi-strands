"use client";

import { Search, Filter } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PricingSearch({
  search,
  onSearchChange,

  status = "all",
  onStatusChange,

  learningMode = "all",
  onLearningModeChange,
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-amber-100 p-2">
          <Filter className="h-5 w-5 text-amber-700" />
        </div>

        <div>
          <h3 className="font-semibold text-neutral-900">Filter Courses</h3>

          <p className="text-sm text-neutral-500">
            Search and filter academy course pricing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Search */}

        <div className="space-y-2">
          <Label htmlFor="search">Search Course</Label>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

            <Input
              id="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Course title..."
              className="h-11 rounded-xl pl-10"
            />
          </div>
        </div>

        {/* Status */}

        <div className="space-y-2">
          <Label htmlFor="status">Pricing Status</Label>

          <select
            id="status"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Courses</option>

            <option value="priced">Has Pricing</option>

            <option value="missing">Missing Pricing</option>

            <option value="active">Active Pricing</option>

            <option value="inactive">Inactive Pricing</option>
          </select>
        </div>

        {/* Learning Mode */}

        <div className="space-y-2">
          <Label htmlFor="mode">Learning Mode</Label>

          <select
            id="mode"
            value={learningMode}
            onChange={(e) => onLearningModeChange(e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Modes</option>

            <option value="physical">Physical</option>

            <option value="online">Online</option>

            <option value="hybrid">Hybrid</option>
          </select>
        </div>
      </div>
    </div>
  );
}
