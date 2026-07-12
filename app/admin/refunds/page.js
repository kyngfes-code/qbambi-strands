"use client";

import { useEffect, useMemo, useState } from "react";

import RefundQueueTable from "@/components/RefundQueueTable";
import ProcessRefundModal from "@/components/ProcessRefundModal";
import AppointmentDetailsModal from "@/components/appointments/AppointmentDetailsModal";
import useRefundActions from "@/hooks/useRefundActions";
import PageSpinner from "@/components/PageSpinner";
import OrderDetailsModal from "@/components/admin/order/OrderDetailsModal";
import OrderRefundQueueTable from "@/components/admin/order/OrderRefundQueueTable";
import useOrderActions from "@/hooks/useOrderActions";
import useOrderRefundActions from "@/hooks/useOrderRefundActions";

export default function RefundsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRefund, setSelectedRefund] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [period, setPeriod] = useState("all");

  const [statusTab, setStatusTab] = useState("pending");
  const [refundSource, setRefundSource] = useState("appointments");

  const [appointmentPendingRefunds, setAppointmentPendingRefunds] = useState(
    [],
  );
  const [appointmentCompletedRefunds, setAppointmentCompletedRefunds] =
    useState([]);

  const [orderPendingRefunds, setOrderPendingRefunds] = useState([]);
  const [orderCompletedRefunds, setOrderCompletedRefunds] = useState([]);

  /*
  ==========================================
  Refresh Refund Dashboard
  ==========================================
  */

  async function refreshRefunds() {
    try {
      setLoading(true);
      setError("");

      await Promise.all([refreshAppointmentRefunds(), refreshOrderRefunds()]);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load refunds");
    } finally {
      setLoading(false);
    }
  }

  const appointmentRefundActions = useRefundActions(refreshRefunds);
  const orderActions = useOrderActions(refreshRefunds);
  const orderRefundActions = useOrderRefundActions(refreshRefunds);

  async function refreshAppointmentRefunds() {
    const res = await fetch("/api/admin/refunds/appointments");
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to load appointment refunds");
    }

    setAppointmentPendingRefunds(data.pendingRefunds || []);
    setAppointmentCompletedRefunds(data.completedRefunds || []);
  }

  async function refreshOrderRefunds() {
    try {
      const res = await fetch("/api/admin/refunds/orders");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load order refunds");
      }

      setOrderPendingRefunds(data.pendingRefunds || []);
      setOrderCompletedRefunds(data.completedRefunds || []);
    } finally {
    }
  }

  /*
  ==========================================
  Initial Load
  ==========================================
  */

  useEffect(() => {
    refreshRefunds();
  }, []);

  const currentPendingRefunds =
    refundSource === "appointments"
      ? appointmentPendingRefunds
      : orderPendingRefunds;

  const currentCompletedRefunds =
    refundSource === "appointments"
      ? appointmentCompletedRefunds
      : orderCompletedRefunds;

  const refunds =
    statusTab === "pending" ? currentPendingRefunds : currentCompletedRefunds;

  /*
  ==========================================
  filtered refunds
  ==========================================
  */
  function filterRefunds(refunds, period) {
    const now = new Date();

    return refunds.filter((refund) => {
      const refundDate = new Date(refund.created_at);

      switch (period) {
        case "today":
          return refundDate.toDateString() === now.toDateString();

        case "week": {
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          return refundDate >= weekAgo;
        }

        case "month":
          return (
            refundDate.getMonth() === now.getMonth() &&
            refundDate.getFullYear() === now.getFullYear()
          );

        case "year":
          return refundDate.getFullYear() === now.getFullYear();

        default:
          return true;
      }
    });
  }

  const filteredRefunds = useMemo(
    () => filterRefunds(refunds, period),
    [refunds, period],
  );

  /*
  ==========================================
  Dashboard Statistics
  ==========================================
  */
  const filteredPendingRefunds = filterRefunds(currentPendingRefunds, period);

  const filteredCompletedRefunds = filterRefunds(
    currentCompletedRefunds,
    period,
  );

  const pendingCount = filteredPendingRefunds.length;

  const completedCount = filteredCompletedRefunds.length;

  const totalRefunded =
    refundSource === "appointments"
      ? filteredCompletedRefunds.reduce(
          (sum, refund) => sum + Number(refund.amount || 0),
          0,
        )
      : filteredCompletedRefunds.reduce(
          (sum, refund) => sum + Number(refund.amount || 0),
          0,
        );

  /*
  ==========================================
  View Appointment
  ==========================================
  */

  function handleViewAppointment(appointment) {
    setSelectedAppointment(appointment);
  }

  /*
  ==========================================
  Open Process Modal
  ==========================================
  */

  function handleOpenProcess(refund) {
    setSelectedRefund(refund);
  }

  return (
    <div className="min-h-screen px-3 py-4 sm:px-5 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}

        <div className="bg-white rounded-2xl border shadow-sm p-5 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Refund Dashboard
              </h1>

              <p className="text-sm text-gray-500 mt-2">
                Review and process customer refunds.
              </p>
            </div>

            <button
              onClick={refreshRefunds}
              className="
                px-5 py-3
                rounded-xl
                bg-black
                text-white
                hover:opacity-90
                transition
                w-full sm:w-auto
              "
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Error */}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}

        {loading ? (
          <PageSpinner />
        ) : (
          <>
            {/* Stats */}
            <div className="bg-white rounded-2xl border p-4 flex flex-wrap gap-2">
              {[
                { value: "today", label: "Today" },
                { value: "week", label: "This Week" },
                { value: "month", label: "This Month" },
                { value: "year", label: "This Year" },
                { value: "all", label: "All Time" },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setPeriod(item.value)}
                  className={`px-4 py-2 rounded-xl border ${
                    period === item.value ? "bg-black text-white" : "bg-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border shadow-sm p-5">
                <p className="text-sm text-gray-500">Pending Refunds</p>

                <p className="text-3xl font-bold mt-2">{pendingCount}</p>
              </div>

              <div className="bg-white rounded-2xl border shadow-sm p-5">
                <p className="text-sm text-gray-500">Completed Refunds</p>

                <p className="text-3xl font-bold mt-2">{completedCount}</p>
              </div>

              <div className="bg-white rounded-2xl border shadow-sm p-5">
                <p className="text-sm text-gray-500">Total Refunded</p>

                <p className="text-3xl font-bold mt-2">
                  ₦{totalRefunded.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Refund Queue */}

            <section className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="flex flex-wrap gap-3 rounded-2xl border bg-white p-3 shadow-sm">
                <button
                  onClick={() => setRefundSource("appointments")}
                  className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                    refundSource === "appointments"
                      ? "bg-black text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Appointment Refunds
                </button>

                <button
                  onClick={() => setRefundSource("orders")}
                  className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                    refundSource === "orders"
                      ? "bg-black text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Order Refunds
                </button>
              </div>
              <div className="p-5 border-b">
                <h2 className="text-xl font-bold">
                  {refundSource === "appointments"
                    ? statusTab === "pending"
                      ? "Appointment Pending Refund Queue"
                      : "Completed Appointment Refunds"
                    : statusTab === "pending"
                      ? "Order Pending Refund Queue"
                      : "Completed Order Refunds"}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {statusTab === "completed"
                    ? "View processed refund history."
                    : "Review and process pending customer refunds."}
                </p>
                <div className="bg-white rounded-2xl border shadow-sm p-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => setStatusTab("pending")}
                    className={`px-4 py-2 rounded-xl ${
                      statusTab === "pending"
                        ? "bg-black text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    Pending ({pendingCount})
                  </button>

                  <button
                    onClick={() => setStatusTab("completed")}
                    className={`px-4 py-2 rounded-xl ${
                      statusTab === "completed"
                        ? "bg-black text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    Completed ({completedCount})
                  </button>
                </div>
              </div>

              {refundSource === "appointments" ? (
                <RefundQueueTable
                  refunds={filteredRefunds}
                  onProcessRefund={handleOpenProcess}
                  onViewAppointment={handleViewAppointment}
                />
              ) : (
                <OrderRefundQueueTable
                  refundRequests={filteredRefunds}
                  onProcessRefund={handleOpenProcess}
                  onViewOrder={orderActions.details.open}
                />
              )}
            </section>
          </>
        )}

        {/* Process Refund */}

        {selectedRefund && (
          <ProcessRefundModal
            type={refundSource}
            refund={selectedRefund}
            isOpen
            loading={
              refundSource === "appointments"
                ? appointmentRefundActions.processingRefund
                : orderRefundActions.processingRefund
            }
            onClose={() => setSelectedRefund(null)}
            onSubmit={(payload) => {
              const action =
                refundSource === "appointments"
                  ? appointmentRefundActions.handleProcessRefund
                  : orderRefundActions.handleProcessRefund;

              action(payload, () => {
                setSelectedRefund(null);
              });
            }}
          />
        )}

        {refundSource === "appointments" ? (
          <AppointmentDetailsModal
            appointment={selectedAppointment}
            onClose={() => setSelectedAppointment(null)}
            isAdmin
          />
        ) : (
          <OrderDetailsModal
            order={orderActions.details.order}
            onClose={orderActions.details.close}
            hideRefundButton={true}
          />
        )}
      </div>
    </div>
  );
}
