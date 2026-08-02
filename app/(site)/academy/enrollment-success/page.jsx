"use client";

import Link from "next/link";
import { CheckCircle2, CalendarDays, Mail, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AcademyEnrollmentSuccessPage() {
  return (
    <main className="bg-neutral-50 py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border bg-white shadow-xl">
          {/* Hero */}

          <div className="bg-[#C6A667]/10 px-8 py-12 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>

            <h1 className="mt-8 text-4xl font-bold tracking-tight text-neutral-900">
              Enrollment Submitted Successfully
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-neutral-600">
              Thank you for choosing <strong>QBambi Academy</strong>. Your
              enrollment application has been received and is now awaiting
              review by our admissions team.
            </p>
          </div>

          {/* Body */}

          <div className="space-y-8 px-8 py-10">
            <div className="rounded-2xl border bg-neutral-50 p-6">
              <h2 className="text-xl font-semibold text-neutral-900">
                What Happens Next?
              </h2>

              <div className="mt-6 space-y-5">
                <div className="flex gap-4">
                  <div className="mt-1 rounded-full bg-[#C6A667]/10 p-2">
                    <Mail className="h-5 w-5 text-[#C6A667]" />
                  </div>

                  <div>
                    <h3 className="font-medium text-neutral-900">
                      Application Review
                    </h3>

                    <p className="mt-1 text-sm leading-7 text-neutral-600">
                      Our admissions team will carefully review your application
                      and verify your selected courses and payment option.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 rounded-full bg-[#C6A667]/10 p-2">
                    <Phone className="h-5 w-5 text-[#C6A667]" />
                  </div>

                  <div>
                    <h3 className="font-medium text-neutral-900">
                      We Will Contact You
                    </h3>

                    <p className="mt-1 text-sm leading-7 text-neutral-600">
                      You'll receive an email or phone call with your admission
                      status, payment instructions, and onboarding details.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 rounded-full bg-[#C6A667]/10 p-2">
                    <CalendarDays className="h-5 w-5 text-[#C6A667]" />
                  </div>

                  <div>
                    <h3 className="font-medium text-neutral-900">
                      Training Begins
                    </h3>

                    <p className="mt-1 text-sm leading-7 text-neutral-600">
                      Once your enrollment and payment have been confirmed,
                      you'll receive your official training schedule and start
                      date.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#C6A667]/10 p-6">
              <h3 className="font-semibold text-neutral-900">
                Need Assistance?
              </h3>

              <p className="mt-2 text-sm leading-7 text-neutral-700">
                If you have any questions regarding your enrollment, payment, or
                course selection, our admissions team is happy to assist you.
              </p>
            </div>

            {/* Actions */}

            <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:justify-center">
              <Button asChild className="h-12 min-w-[180px]">
                <Link href="/">Return Home</Link>
              </Button>

              <Button asChild variant="outline" className="h-12 min-w-[180px]">
                <Link href="/academy">Explore More Courses</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
