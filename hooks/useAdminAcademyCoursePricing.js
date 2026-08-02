"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function useAdminAcademyCoursePricing() {
  //--------------------------------------------------
  // Data
  //--------------------------------------------------

  const [courses, setCourses] = useState([]);
  const [pricing, setPricing] = useState([]);

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
  const [learningMode, setLearningMode] = useState("all");

  //--------------------------------------------------
  // Selected
  //--------------------------------------------------

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedPricing, setSelectedPricing] = useState(null);

  //--------------------------------------------------
  // Dialogs
  //--------------------------------------------------

  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  //////////////////////////////////////////////////////
  // Fetch Courses
  //////////////////////////////////////////////////////

  async function fetchCourses() {
    const res = await fetch("/api/admin/academy/courses?pageSize=1000", {
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Unable to load courses.");
    }

    setCourses(data.courses ?? []);
  }

  //////////////////////////////////////////////////////
  // Fetch Pricing
  //////////////////////////////////////////////////////

  async function fetchPricing() {
    const res = await fetch("/api/admin/academy/course-pricing?pageSize=1000", {
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Unable to load pricing.");
    }

    setPricing(data.pricing ?? []);
  }

  //////////////////////////////////////////////////////
  // Refresh
  //////////////////////////////////////////////////////

  async function refreshData() {
    try {
      setLoading(true);

      await Promise.all([fetchCourses(), fetchPricing()]);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshData();
  }, []);

  //////////////////////////////////////////////////////
  // Merge pricing into courses
  //////////////////////////////////////////////////////

  const courseRows = useMemo(() => {
    return courses.map((course) => ({
      ...course,

      pricing: pricing.filter((item) => item.course_id === course.id),
    }));
  }, [courses, pricing]);

  //////////////////////////////////////////////////////
  // Filter courses
  //////////////////////////////////////////////////////

  const filteredCourses = useMemo(() => {
    return courseRows
      .map((course) => {
        let pricingOptions = course.pricing;

        // Learning mode
        if (learningMode !== "all") {
          pricingOptions = pricingOptions.filter(
            (p) => p.learning_mode === learningMode,
          );
        }

        // Active/inactive
        if (status === "active") {
          pricingOptions = pricingOptions.filter((p) => p.active);
        }

        if (status === "inactive") {
          pricingOptions = pricingOptions.filter((p) => !p.active);
        }

        return {
          ...course,
          pricing: pricingOptions,
        };
      })
      .filter((course) => {
        const matchesSearch =
          !search || course.title.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        if (status === "priced") return course.pricing.length > 0;

        if (status === "missing") return course.pricing.length === 0;

        // Hide courses with no matching pricing
        if (
          status === "active" ||
          status === "inactive" ||
          learningMode !== "all"
        ) {
          return course.pricing.length > 0;
        }

        return true;
      });
  }, [courseRows, search, learningMode, status]);

  //////////////////////////////////////////////////////
  // Create
  //////////////////////////////////////////////////////

  async function createPricing(values) {
    try {
      setSaving(true);

      const res = await fetch("/api/admin/academy/course-pricing", {
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

      toast.success("Pricing created successfully.");

      await refreshData();

      setPricingModalOpen(false);
      setSelectedCourse(null);
      setSelectedPricing(null);

      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  //////////////////////////////////////////////////////
  // Update
  //////////////////////////////////////////////////////

  async function updatePricing(id, values) {
    try {
      setSaving(true);

      const res = await fetch(`/api/admin/academy/course-pricing/${id}`, {
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

      toast.success("Pricing updated successfully.");

      await refreshData();

      setPricingModalOpen(false);
      setSelectedPricing(null);
      setSelectedCourse(null);

      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  //////////////////////////////////////////////////////
  // Delete
  //////////////////////////////////////////////////////

  async function deletePricing(id) {
    try {
      setDeleting(true);

      const res = await fetch(`/api/admin/academy/course-pricing/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      toast.success("Pricing deleted.");

      await refreshData();

      setDeleteDialogOpen(false);
      setSelectedPricing(null);

      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setDeleting(false);
    }
  }

  //////////////////////////////////////////////////////
  // Toggle Status
  //////////////////////////////////////////////////////

  function togglePricingStatus(item) {
    return updatePricing(item.id, {
      active: !item.active,
    });
  }

  //////////////////////////////////////////////////////
  // Dialog Helpers
  //////////////////////////////////////////////////////

  function openCreateModal(course) {
    setSelectedCourse(course);
    setSelectedPricing(null);
    setPricingModalOpen(true);
  }

  function openEditModal(course, pricing) {
    setSelectedCourse(course);
    setSelectedPricing(pricing);
    setPricingModalOpen(true);
  }

  function openDeleteDialog(pricing) {
    setSelectedPricing(pricing);
    setDeleteDialogOpen(true);
  }

  //////////////////////////////////////////////////////

  return {
    courseRows,
    filteredCourses,

    pricing,

    loading,
    saving,
    deleting,

    search,
    setSearch,

    status,
    setStatus,

    learningMode,
    setLearningMode,

    selectedCourse,
    selectedPricing,

    pricingModalOpen,
    deleteDialogOpen,

    setPricingModalOpen,
    setDeleteDialogOpen,

    openCreateModal,
    openEditModal,
    openDeleteDialog,

    createPricing,
    updatePricing,
    deletePricing,
    togglePricingStatus,
  };
}
