"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function useAcademyCourses() {
  ////////////////////////////////////////////////////////////
  // DATA
  ////////////////////////////////////////////////////////////

  const [courses, setCourses] = useState([]);

  ////////////////////////////////////////////////////////////
  // LOADING
  ////////////////////////////////////////////////////////////

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  ////////////////////////////////////////////////////////////
  // FILTERS
  ////////////////////////////////////////////////////////////

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  ////////////////////////////////////////////////////////////
  // DIALOG STATE
  ////////////////////////////////////////////////////////////

  const [selectedCourse, setSelectedCourse] = useState(null);

  const [courseModalOpen, setCourseModalOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  ////////////////////////////////////////////////////////////
  // FETCH COURSES
  ////////////////////////////////////////////////////////////

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (status !== "all") {
        params.set("status", status);
      }

      const queryString = params.toString();

      const url = queryString
        ? `/api/admin/academy/courses?${queryString}`
        : "/api/admin/academy/courses";

      const res = await fetch(url, {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load academy courses.");
      }

      setCourses(data?.courses ?? []);

      return data?.courses ?? [];
    } catch (error) {
      console.error("Academy courses fetch error:", error);

      toast.error(error?.message || "Failed to load academy courses.");

      return [];
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  ////////////////////////////////////////////////////////////
  // INITIAL FETCH
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  ////////////////////////////////////////////////////////////
  // FILTERED COURSES
  //
  // Keep this as a second layer so the UI remains responsive
  // even if the API returns the full course list.
  ////////////////////////////////////////////////////////////

  const filteredCourses = useMemo(() => {
    const term = search.trim().toLowerCase();

    return courses.filter((course) => {
      //////////////////////////////////////////////////////////
      // SEARCH
      //////////////////////////////////////////////////////////

      const matchesSearch =
        !term ||
        course.course_code?.toLowerCase().includes(term) ||
        course.title?.toLowerCase().includes(term) ||
        course.slug?.toLowerCase().includes(term) ||
        course.description?.toLowerCase().includes(term);

      //////////////////////////////////////////////////////////
      // STATUS
      //////////////////////////////////////////////////////////

      const matchesStatus = status === "all" ? true : course.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [courses, search, status]);

  ////////////////////////////////////////////////////////////
  // CREATE COURSE
  ////////////////////////////////////////////////////////////

  const createCourse = useCallback(
    async (values) => {
      try {
        setSaving(true);

        const payload = {
          course_code: values?.course_code?.trim() || "",

          title: values?.title?.trim() || "",

          slug: values?.slug?.trim() || "",

          description: values?.description?.trim() || null,

          thumbnail_path: values?.thumbnail_path?.trim() || null,

          duration_minutes:
            values?.duration_minutes === "" ||
            values?.duration_minutes === null ||
            values?.duration_minutes === undefined
              ? null
              : Number(values.duration_minutes),

          status: values?.status || "draft",

          sort_order:
            values?.sort_order === "" ||
            values?.sort_order === null ||
            values?.sort_order === undefined
              ? 0
              : Number(values.sort_order),
        };

        ////////////////////////////////////////////////////////
        // BASIC CLIENT VALIDATION
        ////////////////////////////////////////////////////////

        if (!payload.course_code) {
          throw new Error("Course code is required.");
        }

        if (!payload.title) {
          throw new Error("Course title is required.");
        }

        if (!payload.slug) {
          throw new Error("Course slug is required.");
        }

        ////////////////////////////////////////////////////////
        // REQUEST
        ////////////////////////////////////////////////////////

        const res = await fetch("/api/admin/academy/courses", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to create academy course.");
        }

        ////////////////////////////////////////////////////////
        // UPDATE LOCAL DATA
        ////////////////////////////////////////////////////////

        if (data?.course) {
          setCourses((current) => [...current, data.course]);
        } else {
          await fetchCourses();
        }

        ////////////////////////////////////////////////////////
        // CLOSE DIALOG
        ////////////////////////////////////////////////////////

        setCourseModalOpen(false);
        setSelectedCourse(null);

        toast.success(data?.message || "Academy course created successfully.");

        return true;
      } catch (error) {
        console.error("Create academy course error:", error);

        toast.error(error?.message || "Failed to create academy course.");

        return false;
      } finally {
        setSaving(false);
      }
    },
    [fetchCourses],
  );

  ////////////////////////////////////////////////////////////
  // UPDATE COURSE
  ////////////////////////////////////////////////////////////

  const updateCourse = useCallback(
    async (id, values) => {
      if (!id) {
        toast.error("Course ID is required.");
        return false;
      }

      try {
        setSaving(true);

        const payload = {};

        ////////////////////////////////////////////////////////
        // ONLY SEND PROVIDED FIELDS
        ////////////////////////////////////////////////////////

        if (values?.course_code !== undefined) {
          payload.course_code = values.course_code?.trim() || "";
        }

        if (values?.title !== undefined) {
          payload.title = values.title?.trim() || "";
        }

        if (values?.slug !== undefined) {
          payload.slug = values.slug?.trim() || "";
        }

        if (values?.description !== undefined) {
          payload.description = values.description?.trim() || null;
        }

        if (values?.thumbnail_path !== undefined) {
          payload.thumbnail_path = values.thumbnail_path?.trim() || null;
        }

        if (values?.duration_minutes !== undefined) {
          payload.duration_minutes =
            values.duration_minutes === "" || values.duration_minutes === null
              ? null
              : Number(values.duration_minutes);
        }

        if (values?.status !== undefined) {
          payload.status = values.status;
        }

        if (values?.sort_order !== undefined) {
          payload.sort_order = Number(values.sort_order);
        }

        ////////////////////////////////////////////////////////
        // REQUEST
        ////////////////////////////////////////////////////////

        const res = await fetch(`/api/admin/academy/courses/${id}`, {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to update academy course.");
        }

        ////////////////////////////////////////////////////////
        // UPDATE LOCAL STATE
        ////////////////////////////////////////////////////////

        if (data?.course) {
          setCourses((current) =>
            current.map((course) => (course.id === id ? data.course : course)),
          );
        } else {
          await fetchCourses();
        }

        ////////////////////////////////////////////////////////
        // UPDATE SELECTED COURSE
        ////////////////////////////////////////////////////////

        if (data?.course && selectedCourse?.id === id) {
          setSelectedCourse(data.course);
        }

        ////////////////////////////////////////////////////////
        // CLOSE EDIT DIALOG
        ////////////////////////////////////////////////////////

        setCourseModalOpen(false);
        setSelectedCourse(null);

        toast.success(data?.message || "Academy course updated successfully.");

        return true;
      } catch (error) {
        console.error("Update academy course error:", error);

        toast.error(error?.message || "Failed to update academy course.");

        return false;
      } finally {
        setSaving(false);
      }
    },
    [fetchCourses, selectedCourse],
  );

  ////////////////////////////////////////////////////////////
  // DELETE COURSE
  ////////////////////////////////////////////////////////////

  const deleteCourse = useCallback(async (id) => {
    if (!id) {
      toast.error("Course ID is required.");
      return false;
    }

    try {
      setDeleting(true);

      const res = await fetch(`/api/admin/academy/courses/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete academy course.");
      }

      ////////////////////////////////////////////////////////
      // REMOVE LOCALLY
      ////////////////////////////////////////////////////////

      setCourses((current) => current.filter((course) => course.id !== id));

      ////////////////////////////////////////////////////////
      // RESET STATE
      ////////////////////////////////////////////////////////

      setDeleteDialogOpen(false);
      setSelectedCourse(null);

      toast.success(data?.message || "Academy course deleted successfully.");

      return true;
    } catch (error) {
      console.error("Delete academy course error:", error);

      toast.error(error?.message || "Failed to delete academy course.");

      return false;
    } finally {
      setDeleting(false);
    }
  }, []);

  ////////////////////////////////////////////////////////////
  // PUBLISH COURSE
  ////////////////////////////////////////////////////////////

  const publishCourse = useCallback(
    async (course) => {
      if (!course?.id) {
        toast.error("Course ID is required.");
        return false;
      }

      return updateCourse(course.id, {
        status: "published",
      });
    },
    [updateCourse],
  );

  ////////////////////////////////////////////////////////////
  // ARCHIVE COURSE
  ////////////////////////////////////////////////////////////

  const archiveCourse = useCallback(
    async (course) => {
      if (!course?.id) {
        toast.error("Course ID is required.");
        return false;
      }

      return updateCourse(course.id, {
        status: "archived",
      });
    },
    [updateCourse],
  );

  ////////////////////////////////////////////////////////////
  // MOVE COURSE TO DRAFT
  ////////////////////////////////////////////////////////////

  const draftCourse = useCallback(
    async (course) => {
      if (!course?.id) {
        toast.error("Course ID is required.");
        return false;
      }

      return updateCourse(course.id, {
        status: "draft",
      });
    },
    [updateCourse],
  );

  ////////////////////////////////////////////////////////////
  // TOGGLE PUBLISH / ARCHIVE
  ////////////////////////////////////////////////////////////

  const toggleCourseStatus = useCallback(
    async (course) => {
      if (!course?.id) {
        toast.error("Course ID is required.");
        return false;
      }

      ////////////////////////////////////////////////////////
      // DRAFT
      ////////////////////////////////////////////////////////

      if (course.status === "draft") {
        return publishCourse(course);
      }

      ////////////////////////////////////////////////////////
      // PUBLISHED
      ////////////////////////////////////////////////////////

      if (course.status === "published") {
        return archiveCourse(course);
      }

      ////////////////////////////////////////////////////////
      // ARCHIVED
      ////////////////////////////////////////////////////////

      if (course.status === "archived") {
        return publishCourse(course);
      }

      return false;
    },
    [archiveCourse, publishCourse],
  );

  ////////////////////////////////////////////////////////////
  // SORT ORDER
  ////////////////////////////////////////////////////////////

  const updateSortOrder = useCallback(
    async (course, sortOrder) => {
      if (!course?.id) {
        toast.error("Course ID is required.");
        return false;
      }

      const numericSortOrder = Number(sortOrder);

      if (Number.isNaN(numericSortOrder)) {
        toast.error("Sort order must be a valid number.");

        return false;
      }

      return updateCourse(course.id, {
        sort_order: numericSortOrder,
      });
    },
    [updateCourse],
  );

  ////////////////////////////////////////////////////////////
  // DURATION
  ////////////////////////////////////////////////////////////

  const updateDuration = useCallback(
    async (course, durationMinutes) => {
      if (!course?.id) {
        toast.error("Course ID is required.");
        return false;
      }

      const duration =
        durationMinutes === "" || durationMinutes === null
          ? null
          : Number(durationMinutes);

      if (duration !== null && (Number.isNaN(duration) || duration < 0)) {
        toast.error("Duration must be a valid positive number.");

        return false;
      }

      return updateCourse(course.id, {
        duration_minutes: duration,
      });
    },
    [updateCourse],
  );

  ////////////////////////////////////////////////////////////
  // DIALOG HELPERS
  ////////////////////////////////////////////////////////////

  const openCreateModal = useCallback(() => {
    setSelectedCourse(null);
    setCourseModalOpen(true);
  }, []);

  ////////////////////////////////////////////////////////////

  const openEditModal = useCallback((course) => {
    setSelectedCourse(course);
    setCourseModalOpen(true);
  }, []);

  ////////////////////////////////////////////////////////////

  const openDeleteDialog = useCallback((course) => {
    setSelectedCourse(course);
    setDeleteDialogOpen(true);
  }, []);

  ////////////////////////////////////////////////////////////
  // CLOSE COURSE MODAL
  ////////////////////////////////////////////////////////////

  const closeCourseModal = useCallback(() => {
    if (saving) return;

    setCourseModalOpen(false);
    setSelectedCourse(null);
  }, [saving]);

  ////////////////////////////////////////////////////////////
  // CLOSE DELETE DIALOG
  ////////////////////////////////////////////////////////////

  const closeDeleteDialog = useCallback(() => {
    if (deleting) return;

    setDeleteDialogOpen(false);
    setSelectedCourse(null);
  }, [deleting]);

  ////////////////////////////////////////////////////////////
  // COURSE COUNTS
  ////////////////////////////////////////////////////////////

  const courseStats = useMemo(() => {
    const total = courses.length;

    const drafts = courses.filter((course) => course.status === "draft").length;

    const published = courses.filter(
      (course) => course.status === "published",
    ).length;

    const archived = courses.filter(
      (course) => course.status === "archived",
    ).length;

    return {
      total,
      drafts,
      published,
      archived,
    };
  }, [courses]);

  ////////////////////////////////////////////////////////////
  // RETURN
  ////////////////////////////////////////////////////////////

  return {
    //////////////////////////////////////////////////////////
    // DATA
    //////////////////////////////////////////////////////////

    courses,
    filteredCourses,
    courseStats,

    //////////////////////////////////////////////////////////
    // LOADING
    //////////////////////////////////////////////////////////

    loading,
    saving,
    deleting,

    //////////////////////////////////////////////////////////
    // FILTERS
    //////////////////////////////////////////////////////////

    search,
    setSearch,

    status,
    setStatus,

    //////////////////////////////////////////////////////////
    // SELECTED COURSE
    //////////////////////////////////////////////////////////

    selectedCourse,

    //////////////////////////////////////////////////////////
    // DIALOGS
    //////////////////////////////////////////////////////////

    courseModalOpen,
    deleteDialogOpen,

    setCourseModalOpen,
    setDeleteDialogOpen,

    closeCourseModal,
    closeDeleteDialog,

    //////////////////////////////////////////////////////////
    // FETCH
    //////////////////////////////////////////////////////////

    fetchCourses,

    //////////////////////////////////////////////////////////
    // DIALOG HELPERS
    //////////////////////////////////////////////////////////

    openCreateModal,
    openEditModal,
    openDeleteDialog,

    //////////////////////////////////////////////////////////
    // CRUD
    //////////////////////////////////////////////////////////

    createCourse,
    updateCourse,
    deleteCourse,

    //////////////////////////////////////////////////////////
    // STATUS
    //////////////////////////////////////////////////////////

    publishCourse,
    archiveCourse,
    draftCourse,
    toggleCourseStatus,

    //////////////////////////////////////////////////////////
    // SORT / METADATA
    //////////////////////////////////////////////////////////

    updateSortOrder,
    updateDuration,
  };
}
