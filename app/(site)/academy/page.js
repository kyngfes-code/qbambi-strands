import { CheckCheckIcon, GraduationCap, Sparkles, Star } from "lucide-react";

import AcadamyPageCard from "@/components/AcadamyPageCard";
import AcademyEnrollmentForm from "@/components/academy/AcademyEnrollmentForm";
import AcademyProgramsAccordion from "@/components/academy/AcademyProgramsAccordion";

import { getAcademyCourses } from "@/lib/data-service";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const metadata = {
  title: "Q-bambi Academy",
};

// =====================================================
// PAGE
// =====================================================

export default async function Page() {
  const courses = await getAcademyCourses();

  const session = await auth();

  let student = null;

  if (session?.user?.id) {
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("academy_students")
      .select(
        `
        id,
        user_id,
        enrollment_id,
        student_number,
        status,
        is_active,
        first_name,
        last_name,
        other_name,
        email,
        phone,
        whatsapp,

        enrollment:academy_enrollments!academy_students_enrollment_id_fkey (
          id,
          enrollment_number,
          gender,
          date_of_birth,
          country,
          state,
          city,
          street_address,
          postal_code,
          occupation,
          education_level,
          emergency_contact_name,
          emergency_contact_phone,
          emergency_contact_relationship,
          referral_source,
          notes
        )
      `,
      )
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (error) {
      console.error("[ACADEMY PAGE] Unable to load existing student", error);
    } else {
      student = data;
    }
  }

  // =====================================================
  // NORMALIZE EXISTING STUDENT DATA
  // =====================================================

  const existingStudent = student
    ? {
        // Academy student
        id: student.id,
        student_number: student.student_number,
        status: student.status,
        is_active: student.is_active,

        // Student identity
        first_name: student.first_name ?? "",
        last_name: student.last_name ?? "",
        other_name: student.other_name ?? "",
        email: student.email ?? "",
        phone: student.phone ?? "",
        whatsapp: student.whatsapp ?? "",

        // Original enrollment
        gender: student.enrollment?.gender ?? "",
        date_of_birth: student.enrollment?.date_of_birth ?? "",

        country: student.enrollment?.country ?? "",
        state: student.enrollment?.state ?? "",
        city: student.enrollment?.city ?? "",
        street_address: student.enrollment?.street_address ?? "",
        postal_code: student.enrollment?.postal_code ?? "",

        occupation: student.enrollment?.occupation ?? "",
        education_level: student.enrollment?.education_level ?? "",

        emergency_contact_name:
          student.enrollment?.emergency_contact_name ?? "",

        emergency_contact_phone:
          student.enrollment?.emergency_contact_phone ?? "",

        emergency_contact_relationship:
          student.enrollment?.emergency_contact_relationship ?? "",

        referral_source: student.enrollment?.referral_source ?? "",

        notes: student.enrollment?.notes ?? "",
      }
    : null;

  // =====================================================
  // EXISTING STUDENT CHECK
  // =====================================================

  const isExistingStudent = Boolean(existingStudent?.id);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#fbf8f2] via-white to-[#f4ece0]">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ===================================================== */}
        {/* HERO */}
        {/* ===================================================== */}

        <section className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_600px] xl:items-start">
          {/* ================================= */}
          {/* LEFT */}
          {/* ================================= */}

          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#C6A667]/10 px-4 py-2 text-sm font-semibold text-[#9a7a38]">
              <GraduationCap className="h-4 w-4" />
              Qbambi Academy
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-tight text-neutral-900 sm:text-5xl lg:text-6xl">
              Turn Your Passion
              <span className="block bg-gradient-to-r from-[#C6A667] to-[#8c6239] bg-clip-text text-transparent">
                Into A Profession
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-600">
              Learn directly from experienced beauty professionals in a premium
              learning environment designed to equip you with practical,
              industry-ready skills, confidence, and business knowledge to
              launch a successful beauty career.
            </p>

            {/* ================================= */}
            {/* COURSES */}
            {/* ================================= */}

            <AcademyProgramsAccordion courses={courses} />

            {/* ================================= */}
            {/* WHY CHOOSE */}
            {/* ================================= */}

            <div className="mt-12">
              <h3 className="text-2xl font-bold text-neutral-900">
                Why Choose Qbambi Academy?
              </h3>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  {
                    title: "Hands-on Practical Training",
                    text: "Learn through real salon sessions, live demonstrations and guided practical classes.",
                  },
                  {
                    title: "Experienced Trainers",
                    text: "Receive mentorship from professionals with years of industry experience.",
                  },
                  {
                    title: "Business Development",
                    text: "Beyond beauty skills, learn how to attract clients, price services and grow your brand.",
                  },
                  {
                    title: "Industry Ready",
                    text: "Graduate with confidence, practical experience and professional certification.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border bg-white p-5 shadow-sm"
                  >
                    <h4 className="font-semibold text-neutral-900">
                      {item.title}
                    </h4>

                    <p className="mt-2 text-sm leading-7 text-neutral-600">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ================================= */}
            {/* GRADUATE WITH */}
            {/* ================================= */}

            <div className="mt-12 rounded-3xl border bg-white p-8 shadow-md">
              <h3 className="text-2xl font-bold">What You'll Graduate With</h3>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {[
                  "Professional practical skills",
                  "Business & client management knowledge",
                  "Certificate of completion",
                  "Confidence to start your beauty career",
                  "Portfolio-ready practical experience",
                  "Ongoing mentorship and support",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCheckIcon className="mt-1 h-5 w-5 text-[#C6A667]" />

                    <span className="text-neutral-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ================================= */}
            {/* STATS */}
            {/* ================================= */}

            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-5 shadow-md">
                <h3 className="text-3xl font-bold text-[#C6A667]">500+</h3>

                <p className="mt-1 text-sm text-neutral-500">
                  Students Trained
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-md">
                <h3 className="text-3xl font-bold text-[#C6A667]">10+</h3>

                <p className="mt-1 text-sm text-neutral-500">
                  Years Experience
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-md">
                <h3 className="text-3xl font-bold text-[#C6A667]">100%</h3>

                <p className="mt-1 text-sm text-neutral-500">
                  Practical Training
                </p>
              </div>
            </div>
          </div>

          {/* ================================= */}
          {/* ENROLLMENT FORM */}
          {/* ================================= */}

          <aside className="min-w-0 xl:sticky xl:top-24 xl:self-start">
            <div className="overflow-hidden rounded-3xl border border-[#C6A667]/20 bg-white shadow-2xl">
              {/* HEADER */}

              <div className="bg-gradient-to-r from-[#C6A667] to-[#9d7740] p-6 text-white">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />

                  <h2 className="text-2xl font-bold">
                    {isExistingStudent
                      ? "Add Another Course"
                      : "Academy Enrollment"}
                  </h2>
                </div>

                <p className="mt-2 text-sm leading-6 text-white/90">
                  {isExistingStudent
                    ? "Select another course and complete your training and payment preferences."
                    : "Complete the form below to begin your professional beauty journey."}
                </p>
              </div>

              {/* FORM */}

              <div className="p-4 sm:p-6">
                <AcademyEnrollmentForm
                  courses={courses}
                  isExistingStudent={isExistingStudent}
                  student={existingStudent}
                />
              </div>
            </div>
          </aside>
        </section>

        {/* ===================================================== */}
        {/* GALLERY */}
        {/* ===================================================== */}

        <section className="mt-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
              Inside Our Academy
            </h2>

            <p className="mt-4 text-base leading-7 text-neutral-500">
              Explore our premium training environment, practical sessions,
              student projects and hands-on learning experience.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl bg-white p-4 shadow-lg sm:p-6">
            <AcadamyPageCard />
          </div>
        </section>

        {/* ===================================================== */}
        {/* TESTIMONIALS */}
        {/* ===================================================== */}

        <section className="mt-20 pb-10">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
              Student Success Stories
            </h2>

            <p className="mt-4 text-base text-neutral-500">
              Hear what our graduates have to say.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[
              {
                name: "Blessing A.",
                review:
                  "The practical classes gave me confidence. I started taking paying clients immediately after graduation.",
              },
              {
                name: "Sarah O.",
                review:
                  "Every lesson was detailed and hands-on. The tutors genuinely wanted every student to succeed.",
              },
              {
                name: "Chioma E.",
                review:
                  "Joining Qbambi Academy completely transformed my career. I now own my own beauty brand.",
              },
            ].map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-3xl border bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="mb-5 flex gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className="h-5 w-5 fill-[#C6A667] text-[#C6A667]"
                    />
                  ))}
                </div>

                <p className="leading-7 text-neutral-600">
                  "{testimonial.review}"
                </p>

                <div className="mt-6 border-t pt-4">
                  <h4 className="font-semibold">{testimonial.name}</h4>

                  <p className="text-sm text-neutral-500">Academy Graduate</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
