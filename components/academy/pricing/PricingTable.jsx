"use client";

import {
  Pencil,
  Trash2,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import CourseStatusBadge from "@/components/academy/courses/CourseStatusBadge";

export default function PricingTable({
  pricing = [],
  loading = false,
  onEdit,
  onDelete,
  onToggleStatus,
  onSortOrderChange,
}) {
  //------------------------------------------------------------
  // Empty
  //------------------------------------------------------------

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center text-neutral-500">
        Loading pricing...
      </div>
    );
  }

  if (!pricing.length) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center text-neutral-500">
        No pricing records found.
      </div>
    );
  }

  //------------------------------------------------------------

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b bg-neutral-50">
            <tr className="text-left text-sm font-semibold text-neutral-600">
              <th className="px-5 py-4">Course</th>

              <th className="px-5 py-4">Learning Mode</th>

              <th className="px-5 py-4">Duration</th>

              <th className="px-5 py-4">Price</th>

              <th className="px-5 py-4">Currency</th>

              <th className="px-5 py-4">Sort</th>

              <th className="px-5 py-4">Status</th>

              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {pricing.map((item) => (
              <tr
                key={item.id}
                className="border-b last:border-b-0 hover:bg-neutral-50"
              >
                {/* Course */}

                <td className="px-5 py-5">
                  <div>
                    <p className="font-medium text-neutral-900">
                      {item.course?.title}
                    </p>
                  </div>
                </td>

                {/* Learning Mode */}

                <td className="px-5 py-5">
                  <span className="rounded-full bg-[#C6A667]/10 px-3 py-1 text-xs font-medium capitalize text-[#8b6b2f]">
                    {item.learning_mode}
                  </span>
                </td>

                {/* Duration */}

                <td className="px-5 py-5">
                  {item.duration_months} Month
                  {item.duration_months > 1 && "s"}
                </td>

                {/* Price */}

                <td className="px-5 py-5 font-semibold text-[#b48a5a]">
                  {new Intl.NumberFormat("en-NG", {
                    style: "currency",
                    currency: item.currency || "NGN",
                    minimumFractionDigits: 2,
                  }).format(Number(item.price))}
                </td>

                {/* Currency */}

                <td className="px-5 py-5">{item.currency || "NGN"}</td>

                {/* Sort */}

                <td className="px-5 py-5">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      defaultValue={item.sort_order ?? 0}
                      className="w-20 rounded-lg border px-2 py-1 text-sm"
                      onBlur={(e) =>
                        onSortOrderChange?.(item.id, Number(e.target.value))
                      }
                    />

                    <ArrowUpDown className="h-4 w-4 text-neutral-400" />
                  </div>
                </td>

                {/* Status */}

                <td className="px-5 py-5">
                  <CourseStatusBadge active={item.active} />
                </td>

                {/* Actions */}

                <td className="px-5 py-5">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => onEdit?.(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => onToggleStatus?.(item)}
                    >
                      {item.active ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                    </Button>

                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => onDelete?.(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
