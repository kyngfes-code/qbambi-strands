"use client";

import { useState } from "react";
import { RefreshCw, CalendarDays, WifiOff, Mail } from "lucide-react";
import Link from "next/link";
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
import AcademyPaymentApprovalTable from "@/components/academy/adminDashboard/AcademyPaymentApprovalTable";
import RejectedApplicationsTable from "@/components/academy/adminDashboard/RejectedApplicationsTable";

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

  ////////////////////////////////////////////////////////////
  // INITIAL LOADING
  ////////////////////////////////////////////////////////////

  if (dashboard.loading && !dashboard.data && !dashboard.error) {
    return <DashboardSkeleton />;
  }

  ////////////////////////////////////////////////////////////
  // NETWORK ERROR WITH NO EXISTING DATA
  ////////////////////////////////////////////////////////////

  if (dashboard.error?.type === "network" && !dashboard.data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <WifiOff className="h-6 w-6 text-amber-700" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-amber-900">
            Connection problem
          </h2>

          <p className="mt-2 text-sm leading-6 text-amber-700">
            We couldn't connect to the academy dashboard. Your internet
            connection may be unstable.
          </p>

          <Button
            type="button"
            onClick={dashboard.refreshDashboard}
            disabled={dashboard.loading}
            className="mt-5"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                dashboard.loading ? "animate-spin" : ""
              }`}
            />

            {dashboard.loading ? "Retrying..." : "Try Again"}
          </Button>
        </div>
      </div>
    );
  }

  ////////////////////////////////////////////////////////////
  // OTHER ERROR WITH NO DATA
  ////////////////////////////////////////////////////////////

  if (dashboard.error && !dashboard.data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-red-900">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-700">
            {dashboard.error.message ||
              "Something went wrong while loading the academy dashboard."}
          </p>

          <Button
            type="button"
            variant="outline"
            onClick={dashboard.refreshDashboard}
            disabled={dashboard.loading}
            className="mt-5"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                dashboard.loading ? "animate-spin" : ""
              }`}
            />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  ////////////////////////////////////////////////////////////
  // DATA
  ////////////////////////////////////////////////////////////

  const stats = dashboard.data?.stats ?? {};

  return (
    <div className="space-y-6">
      {/* ================================================== */}
      {/* NETWORK WARNING WHILE EXISTING DATA IS AVAILABLE */}
      {/* ================================================== */}

      {dashboard.error?.type === "network" && dashboard.data && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <WifiOff className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />

            <div className="flex-1">
              <h3 className="font-semibold text-amber-900">
                Connection problem
              </h3>

              <p className="mt-1 text-sm text-amber-700">
                We couldn't refresh the latest academy data. The information
                currently displayed may be from the previous successful load.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={dashboard.refreshDashboard}
              disabled={dashboard.loading}
              className="shrink-0 border-amber-300 bg-white"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  dashboard.loading ? "animate-spin" : ""
                }`}
              />
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Academy Dashboard
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Monitor enrollments, payments, revenue and academy performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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

            {dashboard.loading ? "Refreshing..." : "Refresh"}
          </Button>

          <Button asChild variant="outline" className="gap-2">
            <Link href="/admin/email-outbox">
              <Mail className="h-4 w-4" />
              Email Outbox
            </Link>
          </Button>
        </div>
      </div>

      {/* ================================================== */}
      {/* STATS */}
      {/* ================================================== */}

      <AcademyStatsCards stats={stats} loading={dashboard.loading} />

      {/* ================================================== */}
      {/* QUICK ACTIONS */}
      {/* ================================================== */}

      <AcademyQuickActions />

      {/* ================================================== */}
      {/* CHARTS */}
      {/* ================================================== */}

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

      {/* ================================================== */}
      {/* REVENUE */}
      {/* ================================================== */}

      <RevenueOverview stats={stats} loading={dashboard.loading} />

      {/* ================================================== */}
      {/* PAYMENT APPROVAL */}
      {/* ================================================== */}

      <AcademyPaymentApprovalTable
        pendingPayments={dashboard.data?.pendingAcademyPayments ?? []}
        paymentVerified={
          dashboard.data?.paymentVerifiedAwaitingActivation ?? []
        }
        loading={dashboard.loading}
        processing={dashboard.processing}
        onVerifyPayment={dashboard.verifyAcademyPayment}
        onActivateStudent={dashboard.activateAcademyStudent}
        onViewReceipt={dashboard.viewAcademyPaymentReceipt}
      />

      {/* ================================================== */}
      {/* PENDING APPROVALS */}
      {/* ================================================== */}

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

      <RejectedApplicationsTable
        applications={dashboard.data?.rejectedApplications ?? []}
        loading={dashboard.loading}
      />

      {/* ================================================== */}
      {/* RECENT ENROLLMENTS / PAYMENTS */}
      {/* ================================================== */}

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

      {/* ================================================== */}
      {/* RECENT ACTIVITY */}
      {/* ================================================== */}

      <RecentActivity
        activities={dashboard.data?.recentActivity ?? []}
        loading={dashboard.loading}
      />

      {/* ================================================== */}
      {/* UPCOMING CLASSES / TOP COURSES */}
      {/* ================================================== */}

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

      {/* ================================================== */}
      {/* APPROVE ENROLLMENT DIALOG */}
      {/* ================================================== */}

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

            await dashboard.refreshDashboard();
          }
        }}
      />

      {/* ================================================== */}
      {/* REJECT ENROLLMENT DIALOG */}
      {/* ================================================== */}

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

            await dashboard.refreshDashboard();
          }
        }}
      />
    </div>
  );
}
