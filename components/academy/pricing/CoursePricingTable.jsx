"use client";

import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  BookOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CoursePricingTable({
  loading = false,
  courses = [],
  onAssignPricing,
  learningMode = "all",
  status = "all",
  onEditPricing,
  onDeletePricing,
  onToggleStatus,
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center">
        Loading courses...
      </div>
    );
  }

  if (!courses.length) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center text-muted-foreground">
        No academy courses found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {courses.map((course) => {
        const pricingOptions = course.pricing;
        return (
          <div
            key={course.id}
            className="overflow-hidden rounded-2xl border bg-white shadow-sm"
          >
            {/* Course Header */}

            <div className="border-b bg-gradient-to-r from-amber-50 to-orange-50 p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-amber-500 p-3 text-white">
                    <BookOpen className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold">{course.title}</h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {course.level}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => onAssignPricing(course)}
                  className="bg-gradient-to-r from-amber-600 to-orange-500"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Pricing Option
                </Button>
              </div>
            </div>

            {/* Pricing Options */}

            {!pricingOptions.length ? (
              <div className="p-8 text-center text-muted-foreground">
                No pricing has been assigned to this course yet.
              </div>
            ) : (
              <>
                {/* Desktop */}

                <div className="hidden overflow-x-auto lg:block">
                  <table className="min-w-full">
                    <thead className="bg-neutral-50">
                      <tr className="text-left text-sm text-neutral-600">
                        <th className="px-6 py-4">Mode</th>
                        <th className="px-6 py-4">Duration</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Currency</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {pricingOptions.map((option) => (
                        <tr
                          key={option.id}
                          className="border-t hover:bg-neutral-50"
                        >
                          <td className="px-6 py-5">
                            <Badge className="capitalize">
                              {option.learning_mode}
                            </Badge>
                          </td>

                          <td className="px-6 py-5">
                            {option.duration_months} Months
                          </td>

                          <td className="px-6 py-5 font-semibold text-amber-700">
                            {new Intl.NumberFormat("en-NG", {
                              style: "currency",
                              currency: option.currency || "NGN",
                            }).format(option.price)}
                          </td>

                          <td className="px-6 py-5">{option.currency}</td>

                          <td className="px-6 py-5">
                            {option.active ? (
                              <Badge className="bg-green-100 text-green-700">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => onEditPricing(course, option)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>

                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => onToggleStatus(option)}
                              >
                                {option.active ? (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                )}
                              </Button>

                              <Button
                                size="icon"
                                variant="destructive"
                                onClick={() => onDeletePricing(option)}
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

                {/* Mobile */}

                <div className="space-y-4 p-5 lg:hidden">
                  {pricingOptions.map((option) => (
                    <div key={option.id} className="rounded-xl border p-4">
                      <div className="flex items-center justify-between">
                        <Badge className="capitalize">
                          {option.learning_mode}
                        </Badge>

                        {option.active ? (
                          <Badge className="bg-green-100 text-green-700">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>

                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Duration</span>
                          <span>{option.duration_months} Months</span>
                        </div>

                        <div className="flex justify-between">
                          <span>Price</span>
                          <span className="font-semibold text-amber-700">
                            {new Intl.NumberFormat("en-NG", {
                              style: "currency",
                              currency: option.currency,
                            }).format(option.price)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 flex gap-2">
                        <Button
                          className="flex-1"
                          variant="outline"
                          onClick={() => onEditPricing(course, option)}
                        >
                          Edit
                        </Button>

                        <Button
                          className="flex-1"
                          variant="outline"
                          onClick={() => onToggleStatus(option)}
                        >
                          {option.active ? "Disable" : "Enable"}
                        </Button>

                        <Button
                          className="flex-1"
                          variant="destructive"
                          onClick={() => onDeletePricing(option)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
