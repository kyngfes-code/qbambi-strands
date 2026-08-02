"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock3,
  GraduationCap,
  MapPin,
  Users,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

//////////////////////////////////////////////////////////////

function formatDate(date) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

//////////////////////////////////////////////////////////////

export default function UpcomingClasses({ classes = [], loading = false }) {
  ////////////////////////////////////////////////////////////

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-xl bg-neutral-100"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  ////////////////////////////////////////////////////////////

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-0">
        {/* Header */}

        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold">Upcoming Classes</h2>

            <p className="mt-1 text-sm text-neutral-500">
              Scheduled academy classes.
            </p>
          </div>

          <Button asChild variant="outline" size="sm">
            <Link href="/admin/academy/classes">
              View Schedule
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Empty */}

        {classes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <GraduationCap className="mb-4 h-12 w-12 text-neutral-300" />

            <h3 className="text-lg font-semibold">No Upcoming Classes</h3>

            <p className="mt-2 text-sm text-neutral-500">
              Scheduled classes will appear here.
            </p>
          </div>
        )}

        {/* Desktop */}

        {classes.length > 0 && (
          <>
            <div className="hidden divide-y lg:block">
              {classes.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-6 py-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-blue-100 p-3">
                      <BookOpen className="h-6 w-6 text-blue-700" />
                    </div>

                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{item.title}</h3>

                        <Badge>{item.learning_mode || "Class"}</Badge>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-5 text-sm text-neutral-500">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />

                          {formatDate(item.start_date)}
                        </span>

                        <span className="flex items-center gap-1">
                          <Clock3 className="h-4 w-4" />

                          {item.start_time || "-"}
                        </span>

                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {item.student_count ?? 0} Students
                        </span>

                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />

                          {item.location || "Academy"}
                        </span>
                      </div>

                      {item.instructor && (
                        <p className="mt-2 text-sm text-neutral-500">
                          Instructor:{" "}
                          <span className="font-medium">{item.instructor}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/academy/classes/${item.id}`}>View</Link>
                  </Button>
                </div>
              ))}
            </div>

            {/* Mobile */}

            <div className="divide-y lg:hidden">
              {classes.map((item) => (
                <div key={item.id} className="space-y-4 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>

                      <p className="mt-1 text-sm text-neutral-500">
                        {item.instructor || "Instructor TBA"}
                      </p>
                    </div>

                    <Badge>{item.learning_mode || "Class"}</Badge>
                  </div>

                  <div className="space-y-2 text-sm text-neutral-500">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />

                      {formatDate(item.start_date)}
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4" />

                      {item.start_time || "-"}
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {item.student_count ?? 0} Students
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />

                      {item.location || "Academy"}
                    </div>
                  </div>

                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/admin/academy/classes/${item.id}`}>
                      View Class
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
