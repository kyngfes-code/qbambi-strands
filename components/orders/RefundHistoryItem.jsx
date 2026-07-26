import { useState } from "react";

export default function RefundHistoryItem({ refund }) {
  const [open, setOpen] = useState(false);

  const approvedAmount = refund.approved_amount ?? refund.requested_amount;

  const partial =
    refund.status === "approved" &&
    Number(approvedAmount) < Number(refund.requested_amount);

  return (
    <div className="rounded-2xl border overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full p-5 text-left hover:bg-neutral-50 transition"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                  refund.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : refund.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {refund.status}
              </span>

              {partial && (
                <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                  Partial Refund
                </span>
              )}
            </div>

            <p className="text-sm text-neutral-500">
              Requested {new Date(refund.created_at).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-neutral-500">Requested</p>

              <p className="font-semibold">
                ₦{Number(refund.requested_amount || 0).toLocaleString()}
              </p>
            </div>

            {refund.status === "approved" && (
              <div className="text-right">
                <p className="text-xs text-neutral-500">Approved</p>

                <p className="font-semibold text-green-700">
                  ₦{Number(approvedAmount || 0).toLocaleString()}
                </p>
              </div>
            )}

            <div className="text-2xl text-neutral-400">{open ? "−" : "+"}</div>
          </div>
        </div>
      </button>

      {/* Body */}
      {open && (
        <div className="border-t p-5 space-y-4 animate-in fade-in duration-200">
          {refund.reason && (
            <div className="rounded-xl bg-neutral-50 p-4">
              <p className="text-sm font-medium">Refund Reason</p>

              <p className="mt-1 text-sm text-neutral-600">{refund.reason}</p>
            </div>
          )}

          {refund.customer_message && (
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-sm font-medium">Customer Message</p>

              <p className="mt-1 text-sm text-neutral-600">
                {refund.customer_message}
              </p>
            </div>
          )}

          {refund.status === "approved" && (
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <strong>Refund Method:</strong> {refund.refund_method || "-"}
              </div>

              <div>
                <strong>Reference:</strong> {refund.refund_reference || "-"}
              </div>

              <div>
                <strong>Reviewed:</strong>{" "}
                {refund.processed_at
                  ? new Date(refund.processed_at).toLocaleString()
                  : "-"}
              </div>

              <div>
                <strong>Approved By:</strong> {refund.processor?.name || "-"}
              </div>

              <div>
                <strong>Requested Amount:</strong> ₦
                {Number(refund.requested_amount || 0).toLocaleString()}
              </div>

              <div>
                <strong>Approved Amount:</strong> ₦
                {Number(approvedAmount || 0).toLocaleString()}
              </div>

              {partial && (
                <div className="sm:col-span-2 rounded-xl bg-amber-50 border border-amber-200 p-3">
                  <strong>Difference:</strong> ₦
                  {(
                    Number(refund.requested_amount) - Number(approvedAmount)
                  ).toLocaleString()}
                </div>
              )}

              {refund.admin_note && (
                <div className="sm:col-span-2">
                  <strong>Admin Note:</strong> {refund.admin_note}
                </div>
              )}
            </div>
          )}

          {refund.status === "rejected" && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="font-medium text-red-700">
                Refund Request Rejected
              </p>

              {refund.admin_note && (
                <p className="mt-2 text-sm text-red-600">{refund.admin_note}</p>
              )}

              <p className="mt-2 text-xs text-neutral-500">
                Reviewed{" "}
                {refund.processed_at
                  ? new Date(refund.processed_at).toLocaleString()
                  : "-"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
