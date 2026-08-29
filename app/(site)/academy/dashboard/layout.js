import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export default async function AcademyDashboardLayout({ children }) {
  // ==========================================================
  // 1. AUTHENTICATION
  // ==========================================================

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // ==========================================================
  // 2. ROLE
  // ==========================================================

  if (session.user.role !== "student") {
    redirect("/");
  }

  const userId = session.user.id;

  // ==========================================================
  // 3. SUPABASE
  // ==========================================================

  const supabase = createSupabaseAdmin();

  // ==========================================================
  // 4. LOAD ACADEMY STUDENT
  //
  // IMPORTANT:
  // academy_students is linked to the logged-in user through
  // user_id.
  //
  // Do NOT use enrollment_id to locate the student.
  // ==========================================================

  const { data: student, error: studentError } = await supabase
    .from("academy_students")
    .select(
      `
        id,
        student_number,
        email,
        status,
        is_active,
        first_name,
        last_name,
        other_name,
        phone,
        whatsapp,
        user_id,
        created_at,
        updated_at
      `,
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (studentError) {
    console.error("Academy student query failed:", studentError);

    return <AcademyAccessError />;
  }

  // ==========================================================
  // 5. STUDENT MUST EXIST
  // ==========================================================

  if (!student) {
    return (
      <AcademyAccessMessage
        title="Student profile unavailable"
        message="Your academy student profile could not be found. Please contact the academy administrator."
      />
    );
  }

  // ==========================================================
  // 6. STUDENT STATUS
  // ==========================================================

  if (student.status !== "active") {
    return (
      <AcademyAccessMessage
        title="Academy access unavailable"
        message="Your academy student account is not currently active."
      />
    );
  }

  if (student.is_active !== true) {
    return (
      <AcademyAccessMessage
        title="Academy access unavailable"
        message="Your academy student account is currently inactive. Please contact the academy administrator."
      />
    );
  }

  // ==========================================================
  // 7. LOAD STUDENT ENROLLMENTS
  //
  // IMPORTANT DATABASE STRUCTURE:
  //
  // academy_enrollments
  //   id
  //   user_id
  //   status
  //
  // academy_enrollment_courses
  //   enrollment_id
  //   course_id
  //
  // Therefore:
  //
  // user
  //   ↓
  // academy_enrollments
  //   ↓
  // academy_enrollment_courses
  //   ↓
  // academy_courses
  //
  // DO NOT query academy_enrollments.course_id
  // because that column does not exist.
  // ==========================================================

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("academy_enrollments")
    .select(
      `
        id,
        user_id,
        enrollment_number,
        status,
        learning_mode,
        total_course_fee,
        amount_paid,
        balance_due,
        payment_status,
        payment_plan_id,
        additional_fee_percentage,
        total_payable,
        initial_payment_amount,
        initial_payment_percentage,
        created_at,
        updated_at
      `,
    )
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (enrollmentsError) {
    console.error("Academy enrollments query failed:", enrollmentsError);

    return <AcademyAccessError />;
  }

  // ==========================================================
  // 8. ONLY ENROLLED RECORDS GRANT DASHBOARD ACCESS
  // ==========================================================

  const enrolledRows = (enrollments ?? []).filter(
    (enrollment) => enrollment.status === "enrolled",
  );

  // ==========================================================
  // 9. NO ACTIVE COURSE
  // ==========================================================

  if (!enrolledRows.length) {
    return (
      <AcademyAccessMessage
        title="No active course enrollment"
        message="You do not currently have an active academy course. Once your enrollment has been approved and activated, it will appear here."
      />
    );
  }

  // ==========================================================
  // 10. VERIFY THAT THE ENROLLMENT HAS COURSES
  //
  // academy_enrollments does NOT contain course_id.
  // We therefore check academy_enrollment_courses.
  // ==========================================================

  const enrollmentIds = enrolledRows.map((enrollment) => enrollment.id);

  const { data: enrollmentCourses, error: enrollmentCoursesError } =
    await supabase
      .from("academy_enrollment_courses")
      .select(
        `
          id,
          enrollment_id,
          course_id
        `,
      )
      .in("enrollment_id", enrollmentIds);

  if (enrollmentCoursesError) {
    console.error(
      "Academy enrollment courses query failed:",
      enrollmentCoursesError,
    );

    return <AcademyAccessError />;
  }

  // ==========================================================
  // 11. ONLY ENROLLMENTS WITH AT LEAST ONE COURSE
  // ==========================================================

  const enrolledCourseEnrollmentIds = new Set(
    (enrollmentCourses ?? []).map((row) => row.enrollment_id),
  );

  const validEnrolledRows = enrolledRows.filter((enrollment) =>
    enrolledCourseEnrollmentIds.has(enrollment.id),
  );

  // ==========================================================
  // 12. NO COURSE ASSIGNMENT
  // ==========================================================

  if (!validEnrolledRows.length) {
    return (
      <AcademyAccessMessage
        title="No course assigned"
        message="Your academy enrollment is active, but no course has been assigned to it yet. Please contact the academy administrator."
      />
    );
  }

  // ==========================================================
  // 13. EVERYTHING PASSED
  // ==========================================================

  return <>{children}</>;
}

// ==========================================================
// PRODUCTION ACCESS ERROR
// ==========================================================

function AcademyAccessError() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <span className="text-xl text-red-600">!</span>
        </div>

        <h1 className="mt-4 text-xl font-semibold text-neutral-900">
          Unable to load your academy account
        </h1>

        <p className="mt-2 text-sm leading-6 text-neutral-500">
          We couldn't verify your academy account right now. Please try again
          later or contact the academy administrator.
        </p>
      </div>
    </main>
  );
}

// ==========================================================
// PRODUCTION ACCESS MESSAGE
// ==========================================================

function AcademyAccessMessage({ title, message }) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
          <span className="text-xl">🎓</span>
        </div>

        <h1 className="mt-4 text-xl font-semibold text-neutral-900">{title}</h1>

        <p className="mt-2 text-sm leading-6 text-neutral-500">{message}</p>
      </div>
    </main>
  );
}
