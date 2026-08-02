"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  DollarSign,
  FileText,
  GraduationCap,
  UserMinus,
  UserPlus,
  Wallet,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

//////////////////////////////////////////////////////////////

const ICONS = {
  enrollment_created: UserPlus,
  enrollment_approved: CheckCircle2,
  enrollment_rejected: UserMinus,
  pricing_assigned: DollarSign,
  payment_recorded: CreditCard,
  refund_processed: Wallet,
  note_added: FileText,
  status_updated: GraduationCap,
};

//////////////////////////////////////////////////////////////

const COLORS = {
  enrollment_created: "bg-blue-100 text-blue-700",
  enrollment_approved: "bg-green-100 text-green-700",
  enrollment_rejected: "bg-red-100 text-red-700",
  pricing_assigned: "bg-purple-100 text-purple-700",
  payment_recorded: "bg-emerald-100 text-emerald-700",
  refund_processed: "bg-orange-100 text-orange-700",
  note_added: "bg-neutral-100 text-neutral-700",
  status_updated: "bg-cyan-100 text-cyan-700",
};

//////////////////////////////////////////////////////////////

function formatDate(date) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

//////////////////////////////////////////////////////////////

function getActivityTitle(activity) {
  switch (activity.activity_type) {
    case "enrollment_created":
      return "New Enrollment";

    case "enrollment_approved":
      return "Enrollment Approved";

    case "enrollment_rejected":
      return "Enrollment Rejected";

    case "pricing_assigned":
      return "Pricing Assigned";

    case "payment_recorded":
      return "Payment Recorded";

    case "refund_processed":
      return "Refund Processed";

    case "note_added":
      return "Admin Note";

    case "status_updated":
      return "Status Updated";

    default:
      return "Activity";
  }
}

//////////////////////////////////////////////////////////////

export default function RecentActivity({ activities = [], loading = false }) {
  ////////////////////////////////////////////////////////////

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-5">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-xl bg-neutral-100"
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
            <h2 className="text-lg font-semibold">Recent Activity</h2>

            <p className="mt-1 text-sm text-neutral-500">
              Latest academy actions and updates.
            </p>
          </div>

          <Button asChild variant="outline" size="sm">
            <Link href="/admin/academy/activity">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Empty */}

        {activities.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <Clock3 className="mb-4 h-12 w-12 text-neutral-300" />

            <h3 className="text-lg font-semibold">No Recent Activity</h3>

            <p className="mt-2 text-sm text-neutral-500">
              Activity will appear here as admins manage the academy.
            </p>
          </div>
        )}

        {/* Timeline */}

        {activities.length > 0 && (
          <div className="divide-y">
            {activities.map((activity) => {
              const Icon = ICONS[activity.activity_type] || Clock3;

              return (
                <div key={activity.id} className="flex gap-4 px-6 py-5">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                      COLORS[activity.activity_type] ||
                      "bg-neutral-100 text-neutral-700"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">
                        {getActivityTitle(activity)}
                      </h3>

                      <Badge variant="secondary">
                        {activity.activity_type?.replaceAll("_", " ")}
                      </Badge>
                    </div>

                    {activity.description && (
                      <p className="mt-2 text-sm text-neutral-600">
                        {activity.description}
                      </p>
                    )}

                    {activity.enrollment && (
                      <p className="mt-2 text-sm font-medium">
                        {activity.enrollment.first_name}{" "}
                        {activity.enrollment.last_name}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                      <span>{formatDate(activity.created_at)}</span>

                      {activity.admin && (
                        <span>
                          By <strong>{activity.admin.name}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {activity.enrollment_id && (
                    <Button asChild variant="ghost" size="sm">
                      <Link
                        href={`/admin/academy/enrollments/${activity.enrollment_id}`}
                      >
                        View
                      </Link>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
