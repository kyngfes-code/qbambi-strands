"use client";

import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  CreditCard,
  FileBarChart,
  GraduationCap,
  PlusCircle,
  Settings,
  Users,
  Wallet,
  Link2,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

//////////////////////////////////////////////////////////////

const actions = [
  {
    title: "New Enrollment",
    description: "Register a new student",
    href: "/admin/academy/enrollments",
    icon: PlusCircle,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Students",
    description: "Manage student enrollments",
    href: "/admin/academy/enrollments",
    icon: Users,
    color: "bg-green-100 text-green-700",
  },
  {
    title: "Courses",
    description: "Manage academy courses",
    href: "/admin/academy/courses",
    icon: BookOpen,
    color: "bg-orange-100 text-orange-700",
  },
  {
    title: "Payment Plans",
    description: "Create installment plans",
    href: "/admin/academy/payment-plans",
    icon: Wallet,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Course Payment Plans",
    description: "Assign plans to courses",
    href: "/admin/academy/course-payment-plans",
    icon: Link2,
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    title: "Payments",
    description: "View academy payments",
    href: "/admin/academy/payments",
    icon: CreditCard,
    color: "bg-purple-100 text-purple-700",
  },
  {
    title: "Reports",
    description: "Revenue & analytics",
    href: "/admin/academy/reports",
    icon: FileBarChart,
    color: "bg-red-100 text-red-700",
  },
  {
    title: "Certificates",
    description: "Issue graduation certificates",
    href: "/admin/academy/certificates",
    icon: GraduationCap,
    color: "bg-cyan-100 text-cyan-700",
  },
  {
    title: "Pricing",
    description: "Manage course pricing",
    href: "/admin/academy/pricing",
    icon: Settings,
    color: "bg-neutral-100 text-neutral-700",
  },
];

//////////////////////////////////////////////////////////////

export default function AcademyQuickActions() {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Quick Actions</h2>

          <p className="mt-1 text-sm text-neutral-500">
            Frequently used academy management tools.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <Link key={action.title} href={action.href} className="group">
                <div className="rounded-xl border bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-md">
                  <div
                    className={`mb-4 inline-flex rounded-xl p-3 ${action.color}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="font-semibold text-neutral-900">
                    {action.title}
                  </h3>

                  <p className="mt-2 text-sm text-neutral-500">
                    {action.description}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-sm font-medium text-neutral-700 transition-all group-hover:gap-3">
                    Open
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
