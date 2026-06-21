"use client";

import { useEffect, useMemo, useState } from "react";

export default function MyRefundsPage() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    loadRefunds();
  }, []);

  async function loadRefunds() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/refunds");

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load refunds.");
      }

      setRefunds(data || []);
    } catch (error) {
      console.error(error);

      setError(error.message || "Failed to load refunds.");
    } finally {
      setLoading(false);
    }
  }

  const pendingRefunds = useMemo(
    () =>
      refunds.filter((r) =>
        ["pending", "processing"].includes(r.refund_status),
      ),
    [refunds],
  );

  const completedRefunds = useMemo(
    () => refunds.filter((r) => r.refund_status === "completed"),
    [refunds],
  );

  const visibleRefunds =
    activeTab === "completed" ? completedRefunds : pendingRefunds;

  return (
    <div className="min-h-screen px-3 py-4 sm:px-5 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border shadow-sm p-5 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold">My Refunds</h1>

          <p className="text-sm text-gray-500 mt-2">
            Track appointment refund requests and completed refunds.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl border shadow-sm p-2 flex gap-2">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${
              activeTab === "pending" ? "bg-black text-white" : "bg-gray-100"
            }`}
          >
            Pending / Processing ({pendingRefunds.length})
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${
              activeTab === "completed" ? "bg-black text-white" : "bg-gray-100"
            }`}
          >
            Completed ({completedRefunds.length})
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-2xl border shadow-sm p-10 text-center">
            Loading refunds...
          </div>
        ) : visibleRefunds.length === 0 ? (
          <div className="bg-white rounded-2xl border shadow-sm p-10 text-center text-gray-500">
            No refunds found.
          </div>
        ) : (
          <div className="grid gap-4">
            {visibleRefunds.map((refund) => (
              <div
                key={refund.id}
                className="bg-white rounded-2xl border shadow-sm p-5"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {refund.appointment?.service_name || "Appointment"}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {refund.appointment?.appointment_date
                        ? new Date(
                            refund.appointment.appointment_date,
                          ).toLocaleDateString()
                        : "-"}
                    </p>

                    {refund.reason && (
                      <p className="text-sm mt-3">
                        <strong>Reason:</strong> {refund.reason}
                      </p>
                    )}
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-xl font-bold text-red-600">
                      ₦{Number(refund.amount || 0).toLocaleString()}
                    </p>

                    <span
                      className={`
                        inline-flex mt-2 px-3 py-1 rounded-full text-xs font-medium
                        ${
                          refund.refund_status === "completed"
                            ? "bg-green-100 text-green-700"
                            : refund.refund_status === "processing"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-orange-100 text-orange-700"
                        }
                      `}
                    >
                      {refund.refund_status}
                    </span>
                  </div>
                </div>

                {/* Completed Refund Details */}
                {refund.refund_status === "completed" && (
                  <div className="mt-4 pt-4 border-t text-sm space-y-2">
                    <p>
                      <strong>Refund Method:</strong>{" "}
                      {refund.refund_method || "-"}
                    </p>

                    <p>
                      <strong>Reference:</strong>{" "}
                      {refund.refund_reference || "-"}
                    </p>

                    <p>
                      <strong>Refunded At:</strong>{" "}
                      {refund.refunded_at
                        ? new Date(refund.refunded_at).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                )}

                {/* Pending Refund Details */}
                {refund.refund_status !== "completed" && (
                  <div className="mt-4 pt-4 border-t text-sm">
                    <p>
                      Requested on{" "}
                      {new Date(refund.created_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
