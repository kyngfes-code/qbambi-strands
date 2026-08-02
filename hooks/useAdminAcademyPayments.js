"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const DEFAULT_FILTERS = {
  search: "",
  status: "all",
  method: "all",
  learningMode: "all",
  course: "all",
  recordedBy: "all",
  period: "all",
};

export default function useAdminAcademyPayments() {
  //--------------------------------------------------
  // State
  //--------------------------------------------------

  const [payments, setPayments] = useState([]);

  const [courses, setCourses] = useState([]);

  const [admins, setAdmins] = useState([]);

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPayments: 0,
    outstandingBalance: 0,
    refunds: 0,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  });

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  //--------------------------------------------------
  // Dialogs
  //--------------------------------------------------

  const [selectedPayment, setSelectedPayment] = useState(null);

  const [paymentDetailsOpen, setPaymentDetailsOpen] = useState(false);

  const [refundDialogOpen, setRefundDialogOpen] = useState(false);

  const [writeOffDialogOpen, setWriteOffDialogOpen] = useState(false);

  //--------------------------------------------------
  // Build Query
  //--------------------------------------------------

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    params.set("page", pagination.page);

    params.set("pageSize", pagination.pageSize);

    Object.entries(filters).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value !== "all"
      ) {
        params.set(key, value);
      }
    });

    return params.toString();
  }, [filters, pagination.page, pagination.pageSize]);

  //--------------------------------------------------
  // Fetch
  //--------------------------------------------------

  const fetchPayments = useCallback(async () => {
    try {
      if (!refreshing) {
        setLoading(true);
      }

      const res = await fetch(`/api/admin/academy/payments?${queryString}`);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load payments.");
      }

      setPayments(data.payments || []);

      setCourses(data.courses || []);

      setAdmins(data.admins || []);

      setStats(
        data.stats || {
          totalRevenue: 0,
          totalPayments: 0,
          outstandingBalance: 0,
          refunds: 0,
        },
      );

      if (data.pagination) {
        setPagination((prev) => ({
          ...prev,
          ...data.pagination,
        }));
      }
    } catch (error) {
      console.error(error);

      alert(error.message);
    } finally {
      setLoading(false);

      setRefreshing(false);
    }
  }, [queryString, refreshing]);

  //--------------------------------------------------

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  //--------------------------------------------------
  // Refresh
  //--------------------------------------------------

  function refresh() {
    setRefreshing(true);

    fetchPayments();
  }

  //--------------------------------------------------
  // Filters
  //--------------------------------------------------

  function updateFilters(values) {
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));

    setFilters(values);
  }

  //--------------------------------------------------
  // Pagination
  //--------------------------------------------------

  function changePage(page) {
    setPagination((prev) => ({
      ...prev,
      page,
    }));
  }

  //--------------------------------------------------
  // Actions
  //--------------------------------------------------

  function openDetails(payment) {
    setSelectedPayment(payment);

    setPaymentDetailsOpen(true);
  }

  function openRefund(payment) {
    setSelectedPayment(payment);

    setRefundDialogOpen(true);
  }

  function openWriteOff(payment) {
    setSelectedPayment(payment);

    setWriteOffDialogOpen(true);
  }

  //--------------------------------------------------
  // Refund
  //--------------------------------------------------

  async function refundPayment(payload) {
    try {
      const res = await fetch(
        `/api/admin/academy/payments/${payload.paymentId}/refund`,
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
        throw new Error(data.error);
      }

      setRefundDialogOpen(false);

      setSelectedPayment(null);

      refresh();

      return true;
    } catch (error) {
      alert(error.message);

      return false;
    }
  }

  //--------------------------------------------------
  // Write Off
  //--------------------------------------------------

  async function writeOffPayment(payload) {
    try {
      const res = await fetch(
        `/api/admin/academy/payments/${payload.paymentId}/write-off`,
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
        throw new Error(data.error);
      }

      setWriteOffDialogOpen(false);

      setSelectedPayment(null);

      refresh();

      return true;
    } catch (error) {
      alert(error.message);

      return false;
    }
  }

  //--------------------------------------------------

  return {
    //--------------------------------------------------
    // data
    //--------------------------------------------------

    payments,

    courses,

    admins,

    stats,

    filters,

    pagination,

    loading,

    refreshing,

    //--------------------------------------------------
    // dialogs
    //--------------------------------------------------

    selectedPayment,

    paymentDetailsOpen,

    refundDialogOpen,

    writeOffDialogOpen,

    setPaymentDetailsOpen,

    setRefundDialogOpen,

    setWriteOffDialogOpen,

    //--------------------------------------------------
    // actions
    //--------------------------------------------------

    refresh,

    updateFilters,

    changePage,

    openDetails,

    openRefund,

    openWriteOff,

    refundPayment,

    writeOffPayment,
  };
}
