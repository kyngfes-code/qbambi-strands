import { useEffect, useMemo, useState } from "react";

export default function useAdminOrders() {
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState("all");

  const [refreshing, setRefreshing] = useState(false);

  const [rawData, setRawData] = useState({
    plans: [],
    history: [],
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

      const [plans, history, overdue, pending, delivered, rejected, cancelled] =
        await Promise.all([
          fetch("/api/admin/payment-plans").then((r) => r.json()),
          fetch("/api/admin/payment-history").then((r) => r.json()),
          fetch("/api/admin/overdue-instalments").then((r) => r.json()),
          fetch("/api/admin/pending-confirmations").then((r) => r.json()),
          fetch("/api/admin/delivered-orders").then((r) => r.json()),
          fetch("/api/admin/payment-rejections").then((r) => r.json()),
          fetch("/api/admin/cancelled-orders").then((r) => r.json()),
        ]);

      setRawData({
        plans,
        history,
        overdue,
        pending,
        deliveredOrders: delivered,
        rejections: rejected,
        cancelledOrders: cancelled,
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

    const history = rawData.history.filter((item) =>
      isWithinPeriod(item.created_at),
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

    // ===== Overview derived from filtered data =====

    const totalRevenue = history.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0,
    );

    const totalOrders =
      pending.length +
      deliveredOrders.length +
      cancelledOrders.length +
      rejections.length;

    const pendingPayments = pending.length;

    const rejectedPayments = rejections.length;

    const overview = {
      totalRevenue,
      totalOrders,
      pendingPayments,
      deliveredOrders: deliveredOrders.length,
      cancelledOrders: cancelledOrders.length,
      rejectedPayments,
    };

    return {
      overview,
      plans,
      history,
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

    data: filteredData,
  };
}
