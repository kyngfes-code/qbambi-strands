"use client";

import { useEffect, useMemo, useState } from "react";

import RefundQueueTable from "@/components/RefundQueueTable";
import ProcessRefundModal from "@/components/ProcessRefundModal";
import AppointmentDetailsModal from "@/components/appointments/AppointmentDetailsModal";

export default function RefundsPage() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRefund, setSelectedRefund] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [processingLoading, setProcessingLoading] = useState(false);

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
  Dashboard Statistics
  ==========================================
  */

  const pendingCount = useMemo(
    () => refunds.filter((r) => r.refund_status === "pending").length,
    [refunds],
  );

  const processingCount = useMemo(
    () => refunds.filter((r) => r.refund_status === "processing").length,
    [refunds],
  );

  const completedCount = useMemo(
    () => refunds.filter((r) => r.refund_status === "completed").length,
    [refunds],
  );

  const totalRefunded = useMemo(
    () =>
      refunds
        .filter((r) => r.refund_status === "completed")
        .reduce((sum, r) => sum + Number(r.amount || 0), 0),
    [refunds],
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

  /*
  ==========================================
  Process Refund
  ==========================================
  */

  async function handleProcessRefund({ refundId, refundMethod, adminNote }) {
    try {
      setProcessingLoading(true);

      const res = await fetch("/api/admin/refunds/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refundId,
          refundMethod,
          adminNote,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process refund");
      }

      alert("Refund processed successfully.");

      setSelectedRefund(null);

      refreshRefunds();
    } catch (error) {
      console.error(error);

      alert(error.message || "Failed to process refund.");
    } finally {
      setProcessingLoading(false);
    }
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
          <div className="bg-white rounded-2xl border shadow-sm p-10 text-center">
            Loading refunds...
          </div>
        ) : (
          <>
            {/* Stats */}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border shadow-sm p-5">
                <p className="text-sm text-gray-500">Pending Refunds</p>

                <p className="text-3xl font-bold mt-2">{pendingCount}</p>
              </div>

              <div className="bg-white rounded-2xl border shadow-sm p-5">
                <p className="text-sm text-gray-500">Processing</p>

                <p className="text-3xl font-bold mt-2">{processingCount}</p>
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
                <h2 className="text-xl font-bold">Refund Queue</h2>

                <p className="text-sm text-gray-500 mt-1">
                  Review and process pending customer refunds.
                </p>
              </div>

              <RefundQueueTable
                refunds={refunds}
                onProcess={handleOpenProcess}
                onViewAppointment={handleViewAppointment}
              />
            </section>
          </>
        )}

        {/* Process Refund */}

        {selectedRefund && (
          <ProcessRefundModal
            refund={selectedRefund}
            loading={processingLoading}
            onClose={() => setSelectedRefund(null)}
            onSubmit={handleProcessRefund}
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
