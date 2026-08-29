// app/academy/dashboard/page.jsx

import AcademyDashboardClient from "@/components/academy/studentDashBoard/AcademyDashboardClient";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * ==========================================================
 * GET ACADEMY DASHBOARD
 * ==========================================================
 *
 * The API returns:
 *
 * {
 *   student,
 *   courses: [
 *     {
 *       enrollment,
 *       course,
 *       paymentPlan,
 *       paymentSummary,
 *       nextPayment,
 *       upcomingPayments,
 *       recentPayments,
 *       timeline
 *     }
 *   ]
 * }
 *
 * A student can have multiple enrolled courses.
 */

async function getDashboard() {
  const requestHeaders = await headers();

  const cookie = requestHeaders.get("cookie") ?? "";

  if (!process.env.NEXTAUTH_URL) {
    console.error("Academy dashboard error: NEXTAUTH_URL is not configured.");

    return null;
  }

  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL}/api/academy/dashboard`,
      {
        method: "GET",

        headers: {
          Cookie: cookie,
        },

        cache: "no-store",
      },
    );

    if (!res.ok) {
      const errorText = await res.text();

      console.error("Academy dashboard API returned:", res.status, errorText);

      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Academy dashboard fetch error:", error);

    return null;
  }
}

export default async function AcademyDashboardPage() {
  const dashboard = await getDashboard();

  // ==========================================================
  // 1. DASHBOARD DATA
  // ==========================================================

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
  // 4. COURSES
  //
  // A student may have multiple enrolled courses.
  // ==========================================================

  const courses = Array.isArray(dashboard.courses) ? dashboard.courses : [];

  // ==========================================================
  // 5. MUST HAVE AT LEAST ONE ACTIVE COURSE
  // ==========================================================

  if (!courses.length) {
    redirect("/account");
  }

  // ==========================================================
  // 6. RENDER CLIENT DASHBOARD
  // ==========================================================

  return <AcademyDashboardClient student={student} courses={courses} />;
}
