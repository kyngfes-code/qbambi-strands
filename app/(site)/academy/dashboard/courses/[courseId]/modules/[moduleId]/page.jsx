import AcademyModuleClient from "@/components/academy/studentDashBoard/AcademyModuleClient";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getModule(courseId, moduleId) {
  const requestHeaders = await headers();
  const cookie = requestHeaders.get("cookie") ?? "";

  if (!process.env.NEXTAUTH_URL) {
    console.error("Academy module page error: NEXTAUTH_URL is not configured.");

    return {
      success: false,
      error: "NEXTAUTH_URL is not configured.",
    };
  }

  const url = `${process.env.NEXTAUTH_URL}/api/academy/courses/${courseId}/modules/${moduleId}`;

  console.log("==================================================");
  console.log("ACADEMY MODULE PAGE");
  console.log("Course ID:", courseId);
  console.log("Module ID:", moduleId);
  console.log("API URL:", url);
  console.log("==================================================");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Cookie: cookie,
      },
      cache: "no-store",
    });

    const responseText = await response.text();

    console.log("Module API status:", response.status);
    console.log("Module API response:", responseText);

    let result;

    try {
      result = JSON.parse(responseText);
    } catch {
      result = {
        success: false,
        error: responseText || "Invalid API response.",
      };
    }

    if (!response.ok) {
      console.error("Academy module API failed:", response.status, result);

      return {
        success: false,
        status: response.status,
        error:
          result?.error || `Module API returned status ${response.status}.`,
      };
    }

    return result;
  } catch (error) {
    console.error("Academy module page fetch failed:", error);

    return {
      success: false,
      error: error?.message || "Unable to load academy module.",
    };
  }
}

export default async function AcademyModulePage({ params }) {
  const { courseId, moduleId } = await params;

  if (!courseId || !moduleId) {
    redirect("/academy/dashboard/courses");
  }

  const moduleData = await getModule(courseId, moduleId);

  /*
   * IMPORTANT:
   *
   * Do NOT silently redirect when the API fails.
   * This allows us to see the actual problem.
   */
  if (!moduleData?.success) {
    console.error("==================================================");
    console.error("ACADEMY MODULE LOAD FAILED");
    console.error("Course ID:", courseId);
    console.error("Module ID:", moduleId);
    console.error("Error:", moduleData?.error);
    console.error("Status:", moduleData?.status);
    console.error("==================================================");

    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-2xl px-4 py-12">
          <div className="rounded-3xl border bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-semibold text-neutral-900">
              Unable to load module
            </h1>

            <p className="mt-3 text-sm leading-6 text-neutral-500">
              {moduleData?.error || "The module could not be loaded."}
            </p>

            <div className="mt-6 rounded-2xl bg-neutral-50 p-4 text-left text-xs text-neutral-500">
              <p>
                <strong>Course:</strong> {courseId}
              </p>

              <p className="mt-1">
                <strong>Module:</strong> {moduleId}
              </p>

              {moduleData?.status && (
                <p className="mt-1">
                  <strong>API status:</strong> {moduleData.status}
                </p>
              )}
            </div>

            <a
              href={`/academy/dashboard/courses/${courseId}`}
              className="mt-6 inline-flex rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Back to Course
            </a>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Validate the exact response expected by AcademyModuleClient.
   */
  if (
    !moduleData.student ||
    !moduleData.course ||
    !moduleData.module ||
    !moduleData.enrollment
  ) {
    console.error("==================================================");
    console.error("ACADEMY MODULE RESPONSE SHAPE INVALID");
    console.error("Response keys:", Object.keys(moduleData));
    console.error("Has student:", !!moduleData.student);
    console.error("Has course:", !!moduleData.course);
    console.error("Has module:", !!moduleData.module);
    console.error("Has enrollment:", !!moduleData.enrollment);
    console.error("==================================================");

    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-2xl px-4 py-12">
          <div className="rounded-3xl border bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-semibold text-neutral-900">
              Invalid module response
            </h1>

            <p className="mt-3 text-sm text-neutral-500">
              The module API responded, but the expected student, course,
              module, or enrollment data is missing.
            </p>

            <a
              href={`/academy/dashboard/courses/${courseId}`}
              className="mt-6 inline-flex rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white"
            >
              Back to Course
            </a>
          </div>
        </div>
      </main>
    );
  }

  return <AcademyModuleClient data={moduleData} />;
}
