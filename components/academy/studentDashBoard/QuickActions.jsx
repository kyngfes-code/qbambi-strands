"use client";

import Link from "next/link";
import {
  BookOpen,
  CreditCard,
  CalendarDays,
  User,
  Bell,
  ArrowRight,
} from "lucide-react";

const actions = [
  {
    title: "My Courses",
    description: "View your enrolled courses and learning materials.",
    href: "/academy/dashboard/courses",
    icon: BookOpen,
    color: "text-[#C6A667]",
    bg: "bg-[#C6A667]/10",
  },
  {
    title: "Payments",
    description: "Track payments, balances and receipts.",
    href: "/academy/dashboard/payments",
    icon: CreditCard,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    title: "Class Schedule",
    description: "Check your upcoming classes and timetable.",
    href: "/academy/dashboard/schedule",
    icon: CalendarDays,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    title: "Profile",
    description: "Manage your personal information.",
    href: "/academy/dashboard/profile",
    icon: User,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  {
    title: "Notifications",
    description: "Stay updated with academy announcements.",
    href: "/academy/dashboard/notifications",
    icon: Bell,
    color: "text-red-600",
    bg: "bg-red-100",
  },
];

export default function QuickActions() {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-[#C6A667]">
            Student Tools
          </p>

          <h2 className="mt-2 text-2xl font-bold">Quick Actions</h2>

          <p className="mt-2 text-sm text-neutral-500">
            Quickly access the most important parts of your student account.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-2xl border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#C6A667] hover:shadow-lg"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${action.bg}`}
              >
                <Icon className={`h-7 w-7 ${action.color}`} />
              </div>

              <h3 className="mt-6 text-lg font-semibold transition group-hover:text-[#C6A667]">
                {action.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-neutral-500">
                {action.description}
              </p>

              <div className="mt-6 flex items-center font-medium text-[#C6A667]">
                Open
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
