"use client";

import NavBarCart from "@/components/NavBarCart";
import { useEffect, useMemo, useState } from "react";

export default function MyRefundsPage() {
  const [pendingRefunds, setPendingRefunds] = useState([]);
  const [approvedRefunds, setApprovedRefunds] = useState([]);
  const [rejectedRefunds, setRejectedRefunds] = useState([]);

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

      setPendingRefunds(data.pendingRefunds || []);
      setApprovedRefunds(data.approvedRefunds || []);
      setRejectedRefunds(data.rejectedRefunds || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load refunds.");
    } finally {
      setLoading(false);
    }
  }

  let visibleRefunds = pendingRefunds;

  if (activeTab === "approved") {
    visibleRefunds = approvedRefunds;
  }

  if (activeTab === "rejected") {
    visibleRefunds = rejectedRefunds;
  }

  const totalRefunded = useMemo(() => {
    return approvedRefunds.reduce(
      (sum, refund) =>
        sum + Number(refund.amount ?? refund.requested_amount ?? 0),
      0,
    );
  }, [approvedRefunds]);

  return (
    <div className="min-h-screen px-3 py-4 sm:px-5 lg:px-8">
      <NavBarCart />

      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold">My Refunds</h1>

          <p className="mt-2 text-sm text-neutral-500">
            Track all of your appointment and order refund requests, including
            pending, approved, and rejected requests.
          </p>
        </div>

        {/* Summary */}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-neutral-500">Pending Requests</p>

            <h2 className="mt-2 text-3xl font-bold text-yellow-600">
              {pendingRefunds.length}
            </h2>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-neutral-500">Approved Refunds</p>

            <h2 className="mt-2 text-3xl font-bold text-green-600">
              {approvedRefunds.length}
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              ₦{totalRefunded.toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-neutral-500">Rejected Requests</p>

            <h2 className="mt-2 text-3xl font-bold text-red-600">
              {rejectedRefunds.length}
            </h2>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 rounded-2xl border bg-white p-2 shadow-sm">
          <button
            onClick={() => setActiveTab("pending")}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              activeTab === "pending" ? "bg-black text-white" : "bg-gray-100"
            }`}
          >
            Pending ({pendingRefunds.length})
          </button>

          <button
            onClick={() => setActiveTab("approved")}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              activeTab === "approved" ? "bg-black text-white" : "bg-gray-100"
            }`}
          >
            Approved ({approvedRefunds.length})
          </button>

          <button
            onClick={() => setActiveTab("rejected")}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              activeTab === "rejected" ? "bg-black text-white" : "bg-gray-100"
            }`}
          >
            Rejected ({rejectedRefunds.length})
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl border bg-white p-10 text-center">
            Loading refunds...
          </div>
        ) : visibleRefunds.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center text-neutral-500">
            No refunds found.
          </div>
        ) : (
          <div className="grid gap-4">
            {visibleRefunds.map((refund) => {
              const status = refund.status;

              const adminNote = refund.admin_note ?? refund.refund_note;
              const isAppointment = refund.type === "appointment";

              const refundMethod = isAppointment ? refund.refund_method : null;

              const refundReference = isAppointment
                ? refund.refund_reference
                : null;

              const processedAt = isAppointment
                ? refund.refunded_at
                : refund.reviewed_at;

              const statusLabel =
                status === "approved"
                  ? "Approved"
                  : status === "rejected"
                    ? "Rejected"
                    : status === "processing"
                      ? "Processing"
                      : "Pending";

              const amount = isAppointment
                ? refund.amount
                : refund.requested_amount;

              const title = isAppointment
                ? refund.appointment?.service_name
                : `Order #${refund.order?.id?.slice(0, 8)}`;

              const eventDate = isAppointment
                ? refund.appointment?.appointment_date
                : refund.order?.created_at;

              return (
                <div
                  key={refund.id}
                  className="rounded-2xl border bg-white p-5 shadow-sm"
                >
                  {/* Header */}
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{title}</h3>

                      {eventDate && (
                        <p className="mt-2 text-sm text-neutral-500">
                          {new Date(eventDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-xl font-bold text-red-600">
                        ₦{Number(amount || 0).toLocaleString()}
                      </p>

                      <span
                        className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          status === "approved"
                            ? "bg-green-100 text-green-700"
                            : status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : status === "processing"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                  </div>

                  {/* Reason */}
                  {refund.reason && (
                    <div className="mt-4 rounded-xl bg-neutral-50 p-4">
                      <p className="text-sm font-medium">Reason</p>

                      <p className="mt-1 text-sm text-neutral-600">
                        {refund.reason}
                      </p>
                    </div>
                  )}

                  {/* Customer Message */}
                  {refund.customer_message && (
                    <div className="mt-3 rounded-xl bg-blue-50 p-4">
                      <p className="text-sm font-medium">Customer Message</p>

                      <p className="mt-1 text-sm text-neutral-600">
                        {refund.customer_message}
                      </p>
                    </div>
                  )}

                  {/* Approved */}
                  {status === "approved" && (
                    <div className="mt-4 border-t pt-4 space-y-2 text-sm">
                      {refundMethod && (
                        <p>
                          <strong>Refund Method:</strong> {refundMethod}
                        </p>
                      )}

                      {refundReference && (
                        <p>
                          <strong>Reference:</strong> {refundReference}
                        </p>
                      )}

                      <p>
                        <strong>Processed:</strong>{" "}
                        {processedAt
                          ? new Date(processedAt).toLocaleString()
                          : "-"}
                      </p>

                      {adminNote && (
                        <p>
                          <strong>Admin Note:</strong> {refund.admin_note}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Rejected */}
                  {status === "rejected" && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                      <p className="font-medium text-red-700">
                        Refund Request Rejected
                      </p>

                      {adminNote && (
                        <p className="mt-2 text-sm text-red-600">
                          {refund.admin_note}
                        </p>
                      )}

                      <p className="mt-2 text-xs text-neutral-500">
                        Reviewed{" "}
                        {refund.reviewed_at
                          ? new Date(refund.reviewed_at).toLocaleString()
                          : "-"}
                      </p>
                    </div>
                  )}

                  {/* Pending */}
                  {status === "pending" && (
                    <div className="mt-4 border-t pt-4 text-sm text-neutral-500">
                      Requested {new Date(refund.created_at).toLocaleString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
