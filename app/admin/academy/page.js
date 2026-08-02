"use client";

import { useState } from "react";

import { RefreshCw, CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";

import DashboardSkeleton from "@/components/academy/adminDashboard/DashboardSkeleton";
import AcademyStatsCards from "@/components/academy/adminDashboard/AcademyStatsCards";
import AcademyQuickActions from "@/components/academy/adminDashboard/AcademyQuickActions";
import EnrollmentChart from "@/components/academy/adminDashboard/EnrollmentChart";
import PaymentChart from "@/components/academy/adminDashboard/PaymentChart";
import RevenueOverview from "@/components/academy/adminDashboard/RevenueOverview";
import PendingApprovals from "@/components/academy/adminDashboard/PendingApprovals";
import RecentEnrollments from "@/components/academy/adminDashboard/RecentEnrollments";
import RecentPayments from "@/components/academy/adminDashboard/RecentPayments";
import RecentActivity from "@/components/academy/adminDashboard/RecentActivity";
import UpcomingClasses from "@/components/academy/adminDashboard/UpcomingClasses";
import TopCourses from "@/components/academy/adminDashboard/TopCourses";
import ApproveEnrollmentDialog from "@/components/academy/enrollments/enrollment/ApproveEnrollmentDialog";
import RejectEnrollmentDialog from "@/components/academy/enrollments/enrollment/RejectEnrollmentDialog";
import { useAdminAcademyDashboard } from "@/hooks/useAdminAcademyDashboard";

export default function AcademyDashboardPage() {
  ////////////////////////////////////////////////////////////
  // Dashboard Hook
  ////////////////////////////////////////////////////////////

  const dashboard = useAdminAcademyDashboard();

  ////////////////////////////////////////////////////////////
  // Dialog State
  ////////////////////////////////////////////////////////////

  const [selectedEnrollment, setSelectedEnrollment] = useState(null);

  const [approveOpen, setApproveOpen] = useState(false);

  const [rejectOpen, setRejectOpen] = useState(false);

  if (dashboard.loading && !dashboard.data) {
    return <DashboardSkeleton />;
  }

  const stats = dashboard.data?.stats ?? {};

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Academy Dashboard
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Monitor enrollments, payments, revenue and academy performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            This Month
          </Button>

          <Button
            onClick={dashboard.refreshDashboard}
            disabled={dashboard.loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                dashboard.loading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <AcademyStatsCards stats={stats} loading={dashboard.loading} />

      <AcademyQuickActions />

      <div className="grid gap-6 xl:grid-cols-2">
        <EnrollmentChart
          data={dashboard.data?.enrollmentTrend ?? []}
          loading={dashboard.loading}
        />

        <PaymentChart
          data={dashboard.data?.paymentTrend ?? []}
          loading={dashboard.loading}
        />
      </div>

      <RevenueOverview stats={stats} loading={dashboard.loading} />

      <PendingApprovals
        enrollments={dashboard.data?.pendingApprovals ?? []}
        loading={dashboard.loading}
        onApprove={(enrollment) => {
          setSelectedEnrollment(enrollment);
          setApproveOpen(true);
        }}
        onReject={(enrollment) => {
          setSelectedEnrollment(enrollment);
          setRejectOpen(true);
        }}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <RecentEnrollments
          enrollments={dashboard.data?.recentEnrollments ?? []}
          loading={dashboard.loading}
        />

        <RecentPayments
          payments={dashboard.data?.recentPayments ?? []}
          loading={dashboard.loading}
        />
      </div>

      <RecentActivity
        activities={dashboard.data?.recentActivity ?? []}
        loading={dashboard.loading}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <UpcomingClasses
          classes={dashboard.data?.upcomingClasses ?? []}
          loading={dashboard.loading}
        />

        <TopCourses
          courses={dashboard.data?.topCourses ?? []}
          loading={dashboard.loading}
        />
      </div>

      {/* ============================================ */}
      {/* Approve Enrollment Dialog */}
      {/* ============================================ */}

      <ApproveEnrollmentDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        enrollment={selectedEnrollment}
        loading={dashboard.processing}
        onSubmit={async (values) => {
          if (!selectedEnrollment) return;

          const success = await dashboard.approveEnrollment(
            selectedEnrollment.id,
            values,
          );

          if (success) {
            setApproveOpen(false);
            setSelectedEnrollment(null);

            dashboard.refreshDashboard();
          }
        }}
      />

      {/* ============================================ */}
      {/* Reject Enrollment Dialog */}
      {/* ============================================ */}

      <RejectEnrollmentDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        enrollment={selectedEnrollment}
        loading={dashboard.processing}
        onSubmit={async (values) => {
          if (!selectedEnrollment) return;

          const success = await dashboard.rejectEnrollment(
            selectedEnrollment.id,
            values,
          );

          if (success) {
            setRejectOpen(false);
            setSelectedEnrollment(null);

            dashboard.refreshDashboard();
          }
        }}
      />
    </div>
  );
}
