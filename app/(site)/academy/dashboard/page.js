// app/academy/dashboard/page.jsx

import EnrollmentOverviewCard from "@/components/academy/studentDashBoard/Enrollment Overview Card";
import NextPaymentCard from "@/components/academy/studentDashBoard/NextPaymentCard";
import PaymentSummaryCard from "@/components/academy/studentDashBoard/PaymentSummaryCard";
import QuickActions from "@/components/academy/studentDashBoard/QuickActions";
import RecentActivityCard from "@/components/academy/studentDashBoard/RecentActivityCard";
import RecentPaymentsCard from "@/components/academy/studentDashBoard/RecentPaymentsCard";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

async function getDashboard() {
  const session = await auth();

  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/academy/dashboard`, {
    headers: {
      Cookie: session?.headers?.cookie ?? "",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function AcademyDashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/academy/login");
  }

  if (session.user.role !== "student") {
    redirect("/");
  }

  const dashboard = await getDashboard();

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}

        <div className="mb-10 flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.25em] text-[#C6A667]">
            Student Dashboard
          </p>

          <h1 className="text-4xl font-bold">
            Welcome back,
            <span className="text-[#C6A667]"> {session.user.name}</span>
          </h1>

          <p className="text-neutral-500">
            Student Number{" "}
            <span className="font-semibold">{session.user.studentNumber}</span>
          </p>
        </div>

        {/* Top Row */}

        <div className="grid gap-6 xl:grid-cols-3">
          <EnrollmentOverviewCard enrollment={dashboard?.enrollment} />

          <PaymentSummaryCard summary={dashboard?.paymentSummary} />

          <NextPaymentCard payment={dashboard?.nextPayment} />
        </div>

        {/* Middle Row */}

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <RecentPaymentsCard payments={dashboard?.recentPayments} />

          <RecentActivityCard timeline={dashboard?.timeline} />
        </div>

        {/* Quick Actions */}

        <div className="mt-8">
          <QuickActions />
        </div>
      </div>
    </main>
  );
}
