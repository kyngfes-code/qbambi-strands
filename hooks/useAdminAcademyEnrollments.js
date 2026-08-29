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

  //-------------------------------------------------------
  // Filters
  //-------------------------------------------------------

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  //-------------------------------------------------------
  // Pagination
  //-------------------------------------------------------

  const [page, setPage] = useState(1);

  const pageSize = 20;

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  });

  //-------------------------------------------------------
  // Dialog
  //-------------------------------------------------------

  const [selectedEnrollment, setSelectedEnrollment] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  //-------------------------------------------------------
  // Query String
  //-------------------------------------------------------

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

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
  // Fetch Enrollments
  //-------------------------------------------------------

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/admin/academy/enrollments?${queryString}`, {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load academy enrollments.");
      }

      setEnrollments(Array.isArray(data.enrollments) ? data.enrollments : []);

      setPagination(
        data.pagination || {
          page,
          pageSize,
          total: 0,
          totalPages: 1,
        },
      );
    } catch (error) {
      console.error("Academy enrollments fetch error:", error);

      alert(error?.message || "Failed to load academy enrollments.");
    } finally {
      setLoading(false);
    }
  }, [queryString, page, pageSize]);

  //-------------------------------------------------------
  // Initial / Query Change Fetch
  //-------------------------------------------------------

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  //-------------------------------------------------------
  // Search
  //-------------------------------------------------------

  const updateSearch = useCallback((value) => {
    setPage(1);
    setSearch(value ?? "");
  }, []);

  //-------------------------------------------------------
  // Filters
  //-------------------------------------------------------

  const updateFilters = useCallback((values) => {
    setPage(1);

    setFilters({
      ...DEFAULT_FILTERS,
      ...(values || {}),
    });
  }, []);

  //-------------------------------------------------------
  // Reset Filters
  //-------------------------------------------------------

  const resetFilters = useCallback(() => {
    setPage(1);
    setFilters({
      ...DEFAULT_FILTERS,
    });
  }, []);

  //-------------------------------------------------------
  // Pagination
  //-------------------------------------------------------

  const changePage = useCallback(
    (nextPage) => {
      const requestedPage = Number(nextPage);

      if (!Number.isInteger(requestedPage)) {
        return;
      }

      if (requestedPage < 1) {
        return;
      }

      if (pagination.totalPages > 0 && requestedPage > pagination.totalPages) {
        return;
      }

      setPage(requestedPage);
    },
    [pagination.totalPages],
  );

  //-------------------------------------------------------
  // Approve
  //-------------------------------------------------------

  const approveEnrollment = useCallback(
    async (id, payload = {}) => {
      if (!id) {
        alert("Enrollment ID is required.");
        return false;
      }

      try {
        setSaving(true);

        const res = await fetch(
          `/api/admin/academy/enrollments/${id}/approve`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify(payload),
          },
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Unable to approve enrollment.");
        }

        await fetchEnrollments();

        return true;
      } catch (error) {
        console.error("Approve academy enrollment error:", error);

        alert(error?.message || "Unable to approve enrollment.");

        return false;
      } finally {
        setSaving(false);
      }
    },
    [fetchEnrollments],
  );

  //-------------------------------------------------------
  // Reject Enrollment
  //-------------------------------------------------------

  const rejectEnrollment = useCallback(
    async (id, rejectionReason = "", adminNote = "") => {
      if (!id) {
        alert("Enrollment ID is required.");
        return false;
      }

      const cleanReason = String(rejectionReason || "").trim();
      const cleanAdminNote = String(adminNote || "").trim();

      if (!cleanReason) {
        alert("Rejection reason is required.");
        return false;
      }

      try {
        setSaving(true);

        const res = await fetch(`/api/admin/academy/enrollments/${id}/reject`, {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            rejection_reason: cleanReason,
            admin_note: cleanAdminNote || null,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Unable to reject enrollment.");
        }

        await fetchEnrollments();

        return true;
      } catch (error) {
        console.error("Reject academy enrollment error:", error);

        alert(error?.message || "Unable to reject enrollment.");

        return false;
      } finally {
        setSaving(false);
      }
    },
    [fetchEnrollments],
  );
  //-------------------------------------------------------
  // Delete
  //-------------------------------------------------------

  const deleteEnrollment = useCallback(
    async (id) => {
      if (!id) {
        alert("Enrollment ID is required.");
        return false;
      }

      try {
        setDeleting(true);

        const res = await fetch(`/api/admin/academy/enrollments/${id}`, {
          method: "DELETE",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Unable to delete enrollment.");
        }

        setDeleteDialogOpen(false);

        setSelectedEnrollment(null);

        await fetchEnrollments();

        return true;
      } catch (error) {
        console.error("Delete academy enrollment error:", error);

        alert(error?.message || "Unable to delete enrollment.");

        return false;
      } finally {
        setDeleting(false);
      }
    },
    [fetchEnrollments],
  );

  //-------------------------------------------------------
  // Delete Dialog
  //-------------------------------------------------------

  const openDeleteDialog = useCallback((enrollment) => {
    if (!enrollment?.id) {
      alert("Enrollment ID is missing.");
      return;
    }

    setSelectedEnrollment(enrollment);
    setDeleteDialogOpen(true);
  }, []);

  //-------------------------------------------------------
  // Close Delete Dialog
  //-------------------------------------------------------

  const closeDeleteDialog = useCallback(() => {
    if (deleting) {
      return;
    }

    setDeleteDialogOpen(false);
    setSelectedEnrollment(null);
  }, [deleting]);

  //-------------------------------------------------------
  // Return
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

    setSearch: updateSearch,

    updateSearch,

    //---------------------------------------------------
    // Filters
    //---------------------------------------------------

    filters,

    updateFilter: updateFilters,

    updateFilters,

    resetFilters,

    //---------------------------------------------------
    // Pagination
    //---------------------------------------------------

    page,

    pageSize,

    pagination,

    goToPage: changePage,

    changePage,

    //---------------------------------------------------
    // Selection
    //---------------------------------------------------

    selectedEnrollment,

    setSelectedEnrollment,

    //---------------------------------------------------
    // Dialog
    //---------------------------------------------------

    deleteDialogOpen,

    setDeleteDialogOpen,

    openDeleteDialog,

    closeDeleteDialog,

    //---------------------------------------------------
    // CRUD
    //---------------------------------------------------

    refreshEnrollments: fetchEnrollments,

    fetchEnrollments,

    approveEnrollment,

    rejectEnrollment,

    deleteEnrollment,
  };
}
