// lib/admin/parseAdminFilters.js

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export default function parseAdminFilters(searchParams) {
  if (!searchParams || typeof searchParams.get !== "function") {
    throw new Error(
      "parseAdminFilters expects URLSearchParams. Pass new URL(req.url).searchParams.",
    );
  }

  const get = (key) => searchParams.get(key);

  //-------------------------------------------------------
  // Pagination
  //-------------------------------------------------------

  const page = Math.max(Number(get("page")) || DEFAULT_PAGE, 1);

  const pageSize = Math.min(
    Math.max(Number(get("pageSize")) || DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE,
  );

  //-------------------------------------------------------
  // Search
  //-------------------------------------------------------

  const search = (get("search") || "").trim();

  //-------------------------------------------------------
  // Status
  //-------------------------------------------------------

  const status = (get("status") || "all").toLowerCase();

  //-------------------------------------------------------
  // Learning Mode
  //-------------------------------------------------------

  const learningMode = (get("learningMode") || "all").toLowerCase();

  //-------------------------------------------------------
  // Sorting
  //-------------------------------------------------------

  const sortBy = get("sortBy") || "created_at";

  const sortOrder =
    (get("sortOrder") || "desc").toLowerCase() === "asc" ? "asc" : "desc";

  //-------------------------------------------------------
  // Optional filters
  //-------------------------------------------------------

  const category = get("category") || "";

  const level = get("level") || "";

  const courseId = get("courseId") || "";

  //-------------------------------------------------------

  return {
    page,

    pageSize,

    search,

    status,

    learningMode,

    sortBy,

    sortOrder,

    category,

    level,

    courseId,
  };
}
