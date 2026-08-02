import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function EnrollmentNotFound() {
  return (
    <div className="flex min-h-[550px] items-center justify-center">
      <div className="max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-neutral-100">
          <span className="text-5xl">📄</span>
        </div>

        <h1 className="text-4xl font-bold">Enrollment Not Found</h1>

        <p className="mt-4 text-neutral-500 leading-7">
          The enrollment you're looking for doesn't exist, may have been
          removed, or the link is no longer valid.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link href="/admin/academy/enrollments">Back to Enrollments</Link>
          </Button>

          <Button asChild>
            <Link href="/admin/academy">Academy Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
