import CourseContentPage from "@/components/academy/courses/CourseContentPage";

export default async function AcademyCourseContentRoute({ params }) {
  const { courseId } = await params;

  return <CourseContentPage courseId={courseId} />;
}
