"use client";

import { useEffect, useMemo, useState } from "react";

import RefundQueueTable from "@/components/RefundQueueTable";
import ProcessRefundModal from "@/components/ProcessRefundModal";
import AppointmentDetailsModal from "@/components/appointments/AppointmentDetailsModal";
import useRefundActions from "@/hooks/useRefundActions";
import PageSpinner from "@/components/PageSpinner";

export default function RefundsPage() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRefund, setSelectedRefund] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [period, setPeriod] = useState("all");

  const actions = useRefundActions(refreshRefunds);

  /*
  ==========================================
  Refresh Refund Dashboard
  ==========================================
  */

  async function refreshRefunds() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/admin/refunds");

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load refunds");
      }

      setRefunds(data || []);
    } catch (err) {
      console.error(err);

      setError(err.message || "Failed to load refunds");
    } finally {
      setLoading(false);
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

  /*
  ==========================================
  filtered refunds
  ==========================================
  */
  const filteredRefunds = useMemo(() => {
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
  }, [refunds, period]);

  /*
  ==========================================
  Filtered data set
  ==========================================
  */
  const visibleRefunds = useMemo(() => {
    return filteredRefunds.filter((refund) => {
      if (activeTab === "pending") {
        return refund.refund_status === "pending";
      }

      if (activeTab === "completed") {
        return refund.refund_status === "completed";
      }

      return true;
    });
  }, [filteredRefunds, activeTab]);

  /*
  ==========================================
  Dashboard Statistics
  ==========================================
  */
  const pendingCount = useMemo(
    () => filteredRefunds.filter((r) => r.refund_status === "pending").length,
    [filteredRefunds],
  );

  const completedCount = useMemo(
    () => filteredRefunds.filter((r) => r.refund_status === "completed").length,
    [filteredRefunds],
  );

  const totalRefunded = useMemo(
    () =>
      filteredRefunds
        .filter((r) => r.refund_status === "completed")
        .reduce((sum, r) => sum + Number(r.amount || 0), 0),
    [filteredRefunds],
  );

  /*
  ==========================================
  View Appointment
  ==========================================
  */

  function handleViewAppointment(refund) {
    setSelectedAppointment(refund.appointment);
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
              <div className="p-5 border-b">
                <h2 className="text-xl font-bold">
                  {activeTab === "completed"
                    ? "Completed Refunds"
                    : "Pending Refund Queue"}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {activeTab === "completed"
                    ? "View processed refund history."
                    : "Review and process pending customer refunds."}
                </p>
                <div className="bg-white rounded-2xl border shadow-sm p-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveTab("pending")}
                    className={`px-4 py-2 rounded-xl ${
                      activeTab === "pending"
                        ? "bg-black text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    Pending ({pendingCount})
                  </button>

                  <button
                    onClick={() => setActiveTab("completed")}
                    className={`px-4 py-2 rounded-xl ${
                      activeTab === "completed"
                        ? "bg-black text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    Completed ({completedCount})
                  </button>
                </div>
              </div>

              <RefundQueueTable
                refunds={visibleRefunds}
                onProcessRefund={handleOpenProcess}
                onViewAppointment={handleViewAppointment}
              />
            </section>
          </>
        )}

        {/* Process Refund */}

        {selectedRefund && (
          <ProcessRefundModal
            refund={selectedRefund}
            loading={actions.processingRefund}
            onClose={() => setSelectedRefund(null)}
            onSubmit={(payload) =>
              actions.handleProcessRefund(payload, () => {
                setSelectedRefund(null);
              })
            }
          />
        )}

        {/* Appointment Details */}

        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      </div>
    </div>
  );
}
