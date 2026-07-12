import { useEffect, useMemo, useState } from "react";

export default function useAdminOrders() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState("all");

  const [rawData, setRawData] = useState({
    overview: null,
    plans: [],
    transactions: [],
    overdue: [],
    pending: [],
    deliveredOrders: [],
    rejections: [],
    cancelledOrders: [],
  });

  async function loadAdminData(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [
        overview,
        plans,
        transactions,
        overdue,
        pending,
        delivered,
        rejected,
        cancelled,
      ] = await Promise.all([
        fetch("/api/admin/overview").then((r) => r.json()),
        fetch("/api/admin/payment-plans").then((r) => r.json()),
        fetch("/api/admin/payment-history").then((r) => r.json()),
        fetch("/api/admin/overdue-instalments").then((r) => r.json()),
        fetch("/api/admin/pending-confirmations").then((r) => r.json()),
        fetch("/api/admin/delivered-orders").then((r) => r.json()),
        fetch("/api/admin/payment-rejections").then((r) => r.json()),
        fetch("/api/admin/cancelled-orders").then((r) => r.json()),
      ]);

      setRawData({
        overview: overview ?? null,
        plans: Array.isArray(plans) ? plans : [],
        transactions: Array.isArray(transactions) ? transactions : [],
        overdue: Array.isArray(overdue) ? overdue : [],
        pending: Array.isArray(pending) ? pending : [],
        deliveredOrders: Array.isArray(delivered) ? delivered : [],
        rejections: Array.isArray(rejected) ? rejected : [],
        cancelledOrders: Array.isArray(cancelled) ? cancelled : [],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const refresh = () => loadAdminData(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const isWithinPeriod = (dateValue) => {
    if (!dateValue || period === "all") return true;

    const date = new Date(dateValue);
    const now = new Date();

    switch (period) {
      case "today":
        return date.toDateString() === now.toDateString();

      case "week": {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return date >= weekAgo;
      }

      case "month":
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );

      case "year":
        return date.getFullYear() === now.getFullYear();

      default:
        return true;
    }
  };

  const filteredData = useMemo(() => {
    const plans = rawData.plans.filter((plan) =>
      isWithinPeriod(plan.created_at),
    );

    const transactions = rawData.transactions.filter((tx) =>
      isWithinPeriod(tx.created_at),
    );

    const overdue = rawData.overdue.filter((item) =>
      isWithinPeriod(item.created_at),
    );

    const pending = rawData.pending.filter((item) =>
      isWithinPeriod(item.created_at),
    );

    const deliveredOrders = rawData.deliveredOrders.filter((item) =>
      isWithinPeriod(item.delivered_at || item.created_at),
    );

    const rejections = rawData.rejections.filter((item) =>
      isWithinPeriod(item.created_at),
    );

    const cancelledOrders = rawData.cancelledOrders.filter((item) =>
      isWithinPeriod(item.cancelled_at || item.created_at),
    );

    const overview = {
      grossRevenue: 0,
      totalRefunds: 0,
      netRevenue: 0,

      totalOrders: 0,

      awaitingPaymentConfirmation: 0,
      awaitingDeliveryConfirmation: 0,
      pendingOrders: 0,

      deliveredOrders: 0,
      cancelledOrders: 0,
      rejectedPayments: 0,

      ...(rawData.overview ?? {}),
    };

    return {
      overview,
      plans,
      transactions,
      overdue,
      pending,
      deliveredOrders,
      rejections,
      cancelledOrders,
    };
  }, [rawData, period]);

  return {
    loading,
    refreshing,
    period,
    setPeriod,
    refresh,
    loadAdminData,
    data: filteredData,
  };
}
