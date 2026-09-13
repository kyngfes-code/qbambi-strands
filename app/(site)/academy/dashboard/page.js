import AcademyDashboardClient from "@/components/academy/studentDashBoard/AcademyDashboardClient";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// ==========================================================
// GET DASHBOARD DATA
// ==========================================================

async function getDashboard() {
  const requestHeaders = await headers();

  const cookie = requestHeaders.get("cookie") ?? "";

  if (!process.env.NEXTAUTH_URL) {
    console.error("Academy dashboard error: NEXTAUTH_URL is not configured.");

    return null;
  }

  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/academy/dashboard`,
      {
        method: "GET",

        headers: {
          Cookie: cookie,
        },

        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Academy dashboard API returned:",
        response.status,
        errorText,
      );

      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Academy dashboard fetch error:", error);

    return null;
  }
}

// ==========================================================
// ACADEMY DASHBOARD PAGE
// ==========================================================

export default async function AcademyDashboardPage() {
  // ==========================================================
  // 1. LOAD DASHBOARD
  // ==========================================================

  const dashboard = await getDashboard();

  if (!dashboard) {
    redirect("/account");
  }

  // ==========================================================
  // 2. STUDENT
  // ==========================================================

  const student = dashboard.student;

  if (!student) {
    redirect("/account");
  }

  // ==========================================================
  // 3. STUDENT SECURITY
  // ==========================================================

  if (student.status !== "active") {
    redirect("/account");
  }

  if (student.is_active !== true) {
    redirect("/account");
  }

  // ==========================================================
  // 4. ALL ENROLLMENTS
  //
  // The API is enrollment-centric and can return:
  //
  // pending
  // confirmed
  // payment_verified
  // enrolled
  // completed
  //
  // The learning dashboard should only expose enrolled
  // records.
  // ==========================================================

  const enrollments = Array.isArray(dashboard.enrollments)
    ? dashboard.enrollments
    : [];

  // ==========================================================
  // 5. ACTIVE / ENROLLED ENROLLMENTS
  //
  // Only "enrolled" enrollments have learning access.
  //
  // Courses remain children of each enrollment.
  // ==========================================================

  const activeEnrollments = enrollments.filter(
    (item) =>
      item?.enrollment?.status === "enrolled" &&
      Array.isArray(item?.courses) &&
      item.courses.length > 0,
  );

  // ==========================================================
  // 6. NO ACTIVE ENROLLMENTS
  //
  // A student may still have another enrollment that is:
  //
  // - pending
  // - confirmed
  // - payment_verified
  //
  // Those should be handled by the account/payment flow,
  // not presented as active learning courses.
  // ==========================================================

  if (!activeEnrollments.length) {
    redirect("/account");
  }

  // ==========================================================
  // 7. NORMALIZE GLOBAL DATA
  // ==========================================================

  const summary = dashboard.summary ?? null;

  const recentPayments = Array.isArray(dashboard.recentPayments)
    ? dashboard.recentPayments
    : [];

  const recentActivity = Array.isArray(dashboard.recentActivity)
    ? dashboard.recentActivity
    : [];

  // ==========================================================
  // 8. RENDER ENROLLMENT-CENTRIC DASHBOARD
  //
  // IMPORTANT:
  //
  // Do NOT pass dashboard.courses as the primary prop.
  //
  // The client receives:
  //
  // student
  // enrollments
  // summary
  // recentPayments
  // recentActivity
  // ==========================================================

  return (
    <AcademyDashboardClient
      student={student}
      enrollments={activeEnrollments}
      summary={summary}
      recentPayments={recentPayments}
      recentActivity={recentActivity}
    />
  );
}
