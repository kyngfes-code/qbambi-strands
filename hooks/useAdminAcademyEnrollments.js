"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const DEFAULT_FILTERS = {
  status: "",
  learningMode: "",
  paymentPlan: "",
  dateFrom: "",
  dateTo: "",
};

export default function useAdminAcademyEnrollments() {
  //-------------------------------------------------------
  // Data
  //-------------------------------------------------------

  const [enrollments, setEnrollments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(false);

  //-------------------------------------------------------
  // Search
  //-------------------------------------------------------

  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  //-------------------------------------------------------
  // Pagination
  //-------------------------------------------------------

  const [page, setPage] = useState(1);

  const [pageSize] = useState(20);

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  });

  //-------------------------------------------------------
  // Dialogs
  //-------------------------------------------------------

  const [selectedEnrollment, setSelectedEnrollment] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  //-------------------------------------------------------
  // Query String
  //-------------------------------------------------------

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    params.set("page", page);

    params.set("pageSize", pageSize);

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (filters.status) {
      params.set("status", filters.status);
    }

    if (filters.learningMode) {
      params.set("learningMode", filters.learningMode);
    }

    if (filters.paymentPlan) {
      params.set("paymentPlan", filters.paymentPlan);
    }

    if (filters.dateFrom) {
      params.set("dateFrom", filters.dateFrom);
    }

    if (filters.dateTo) {
      params.set("dateTo", filters.dateTo);
    }

    return params.toString();
  }, [page, pageSize, search, filters]);

  //-------------------------------------------------------
  // Fetch
  //-------------------------------------------------------

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/admin/academy/enrollments?${queryString}`);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load enrollments.");
      }

      setEnrollments(data.enrollments ?? []);

      setPagination(
        data.pagination ?? {
          page: 1,
          pageSize,
          total: 0,
          totalPages: 1,
        },
      );
    } catch (error) {
      console.error(error);

      alert(error.message);
    } finally {
      setLoading(false);
    }
  }, [queryString, pageSize]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  //-------------------------------------------------------
  // Search
  //-------------------------------------------------------

  function updateSearch(value) {
    setPage(1);

    setSearch(value);
  }

  //-------------------------------------------------------
  // Filters
  //-------------------------------------------------------

  function updateFilters(values) {
    setPage(1);

    setFilters(values);
  }

  function resetFilters() {
    setPage(1);

    setFilters(DEFAULT_FILTERS);
  }

  //-------------------------------------------------------
  // Pagination
  //-------------------------------------------------------

  function changePage(nextPage) {
    setPage(nextPage);
  }

  //-------------------------------------------------------
  // Approve
  //-------------------------------------------------------

  async function approveEnrollment(id) {
    try {
      setSaving(true);

      const res = await fetch(`/api/admin/academy/enrollments/${id}/approve`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      await fetchEnrollments();

      return true;
    } catch (error) {
      alert(error.message);

      return false;
    } finally {
      setSaving(false);
    }
  }

  //-------------------------------------------------------
  // Reject
  //-------------------------------------------------------

  async function rejectEnrollment(id, reason = "") {
    try {
      setSaving(true);

      const res = await fetch(`/api/admin/academy/enrollments/${id}/reject`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          reason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      await fetchEnrollments();

      return true;
    } catch (error) {
      alert(error.message);

      return false;
    } finally {
      setSaving(false);
    }
  }

  //-------------------------------------------------------
  // Delete
  //-------------------------------------------------------

  async function deleteEnrollment(id) {
    try {
      setDeleting(true);

      const res = await fetch(`/api/admin/academy/enrollments/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setDeleteDialogOpen(false);

      setSelectedEnrollment(null);

      await fetchEnrollments();

      return true;
    } catch (error) {
      alert(error.message);

      return false;
    } finally {
      setDeleting(false);
    }
  }

  //-------------------------------------------------------
  // Dialog Helpers
  //-------------------------------------------------------

  function openDeleteDialog(enrollment) {
    setSelectedEnrollment(enrollment);

    setDeleteDialogOpen(true);
  }

  function closeDeleteDialog() {
    setDeleteDialogOpen(false);

    setSelectedEnrollment(null);
  }

  //-------------------------------------------------------

  return {
    //---------------------------------------------------
    // Data
    //---------------------------------------------------

    enrollments,

    loading,

    saving,

    deleting,

    //---------------------------------------------------
    // Search
    //---------------------------------------------------

    search,

    updateSearch,

    //---------------------------------------------------
    // Filters
    //---------------------------------------------------

    filters,

    updateFilters,

    resetFilters,

    //---------------------------------------------------
    // Pagination
    //---------------------------------------------------

    page,

    pageSize,

    pagination,

    changePage,

    //---------------------------------------------------
    // Selection
    //---------------------------------------------------

    selectedEnrollment,

    setSelectedEnrollment,

    //---------------------------------------------------
    // Dialogs
    //---------------------------------------------------

    deleteDialogOpen,

    openDeleteDialog,

    closeDeleteDialog,

    //---------------------------------------------------
    // CRUD
    //---------------------------------------------------

    fetchEnrollments,

    approveEnrollment,

    rejectEnrollment,

    deleteEnrollment,
  };
}
