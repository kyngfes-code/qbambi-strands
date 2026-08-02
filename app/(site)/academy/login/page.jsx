import LoginForm from "@/components/academy/login/LoginForm";

export const metadata = {
  title: "Academy Student Login | QBambi Strands",
};

export default function AcademyLoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-[#faf8f4] to-[#f8f3ea]">
      <div className="container mx-auto flex min-h-screen max-w-7xl items-center px-6 py-16">
        <div className="grid w-full gap-16 lg:grid-cols-2">
          {/* Left */}

          <div className="hidden flex-col justify-center lg:flex">
            <span className="mb-5 inline-flex w-fit rounded-full bg-[#C6A667]/10 px-4 py-2 text-sm font-medium text-[#8b6b2f]">
              QBambi Academy
            </span>

            <h1 className="max-w-xl text-5xl font-bold leading-tight text-neutral-900">
              Welcome back to your student portal.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-neutral-600">
              Access your courses, payments, schedules, learning resources,
              assignments, and progress all in one place.
            </p>

            <div className="mt-10 space-y-4">
              {[
                "Track your learning progress",
                "Manage tuition payments",
                "View class schedules",
                "Download certificates",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-[#C6A667]" />
                  <span className="text-neutral-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}

          <LoginForm />
        </div>
      </div>
    </main>
  );
}
