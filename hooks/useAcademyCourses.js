"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function useAcademyCourses() {
  //--------------------------------------------------
  // Data
  //--------------------------------------------------

  const [courses, setCourses] = useState([]);

  //--------------------------------------------------
  // Loading
  //--------------------------------------------------

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  //--------------------------------------------------
  // Filters
  //--------------------------------------------------

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  //--------------------------------------------------
  // Dialogs
  //--------------------------------------------------

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  //--------------------------------------------------
  // Fetch Courses
  //--------------------------------------------------

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/academy/courses", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load courses.");
      }

      setCourses(data.courses || []);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  //--------------------------------------------------
  // Filtered Courses
  //--------------------------------------------------

  const filteredCourses = useMemo(() => {
    const term = search.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesSearch =
        !term ||
        course.title?.toLowerCase().includes(term) ||
        course.slug?.toLowerCase().includes(term) ||
        course.level?.toLowerCase().includes(term);

      const matchesStatus =
        status === "all"
          ? true
          : status === "active"
            ? course.active
            : !course.active;

      return matchesSearch && matchesStatus;
    });
  }, [courses, search, status]);

  //--------------------------------------------------
  // Create
  //--------------------------------------------------

  async function createCourse(values) {
    try {
      setSaving(true);

      const res = await fetch("/api/admin/academy/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      await fetchCourses();

      setCourseModalOpen(false);
      setSelectedCourse(null);

      return true;
    } catch (err) {
      console.error(err);
      toast.error(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  //--------------------------------------------------
  // Update
  //--------------------------------------------------

  async function updateCourse(id, values) {
    try {
      setSaving(true);

      const res = await fetch(`/api/admin/academy/courses/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      await fetchCourses();

      toast.success(data.message || "Course updated successfully.");

      setCourseModalOpen(false);
      setSelectedCourse(null);

      return true;
    } catch (err) {
      console.error(err);
      toast.error(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  //--------------------------------------------------
  // Delete
  //--------------------------------------------------

  async function deleteCourse(id) {
    try {
      setDeleting(true);

      const res = await fetch(`/api/admin/academy/courses/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      await fetchCourses();

      setDeleteDialogOpen(false);
      setSelectedCourse(null);

      return true;
    } catch (err) {
      console.error(err);
      toast.error(err.message);
      return false;
    } finally {
      setDeleting(false);
    }
  }

  //--------------------------------------------------
  // Toggle Active
  //--------------------------------------------------

  function toggleCourseStatus(course) {
    return updateCourse(course.id, {
      active: !course.active,
    });
  }

  //--------------------------------------------------
  // Sort Order
  //--------------------------------------------------

  function updateSortOrder(course, sortOrder) {
    return updateCourse(course.id, {
      sort_order: Number(sortOrder),
    });
  }

  //--------------------------------------------------
  // Dialog Helpers
  //--------------------------------------------------

  function openCreateModal() {
    setSelectedCourse(null);
    setCourseModalOpen(true);
  }

  function openEditModal(course) {
    setSelectedCourse(course);
    setCourseModalOpen(true);
  }

  function openDeleteDialog(course) {
    setSelectedCourse(course);
    setDeleteDialogOpen(true);
  }

  //--------------------------------------------------

  return {
    courses,
    filteredCourses,

    loading,
    saving,
    deleting,

    search,
    setSearch,

    status,
    setStatus,

    selectedCourse,

    courseModalOpen,
    deleteDialogOpen,

    setCourseModalOpen,
    setDeleteDialogOpen,

    fetchCourses,

    openCreateModal,
    openEditModal,
    openDeleteDialog,

    createCourse,
    updateCourse,
    deleteCourse,

    toggleCourseStatus,
    updateSortOrder,
  };
}
