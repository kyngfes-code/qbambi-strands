"use client";

export default function PendingConfirmationsTable({
  orders = [],
  onConfirm,
  onConfirmInstalment,
  onConfirmDelivery,
  onViewOrder,
  onReject,
  onCancel,
  onRefund,
}) {
  if (!orders.length) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center text-neutral-500">
        No open orders.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1300px] w-full text-sm">
          <thead className="bg-neutral-100">
            <tr className="text-left">
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Payment</th>
              <th className="px-4 py-3 font-semibold">Order Status</th>
              <th className="px-4 py-3 font-semibold text-right">Amount</th>
              <th className="px-4 py-3 font-semibold">Receipt</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => {
              const isInstalment = o.type === "instalment";

              const isBankTransfer = o.payment_method === "bank_transfer";
              const isPaystack = o.payment_method === "paystack";

              // Workflow state (comes from orders table)
              const isAwaitingConfirmation =
                o.status === "awaiting_confirmation";
              const isPaid = o.status === "paid";

              // Audit/payment state (comes from payment_transactions)
              const isTransactionPending = o.transaction_status === "pending";

              const isTransactionVerified = o.transaction_status === "verified";

              /**
               * Button Rules
               *
               * BANK TRANSFER
               * pending tx + awaiting_confirmation order
               *      -> Confirm Payment
               *
               * verified tx + paid order
               *      -> Confirm Delivery
               *
               * PAYSTACK
               * verified tx + paid order
               *      -> Confirm Delivery
               */

              const showConfirmPayment =
                !isInstalment &&
                isBankTransfer &&
                isAwaitingConfirmation &&
                isTransactionPending;

              const showConfirmInstalment =
                isInstalment && isAwaitingConfirmation && isTransactionPending;

              const showConfirmDelivery = isPaid && isTransactionVerified;

              return (
                <tr
                  key={`${o.id}-${o.instalment_id ?? "full"}`}
                  className="border-t hover:bg-neutral-50 transition"
                >
                  {/* Order */}
                  <td className="px-4 py-4 align-top">
                    <button
                      onClick={() => onViewOrder(o.id)}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      #{o.id.slice(0, 8)}
                    </button>

                    {isInstalment && (
                      <div className="mt-1 text-xs text-neutral-500">
                        Instalment #{o.instalment_number}
                      </div>
                    )}
                  </td>

                  {/* Customer */}
                  <td className="px-4 py-4 align-top">
                    <div className="font-medium">{o.customer?.name ?? "-"}</div>

                    <div className="text-xs text-neutral-500">
                      {o.customer?.email ?? "-"}
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="px-4 py-4 whitespace-nowrap align-top">
                    {o.customer?.phone ?? "-"}
                  </td>

                  {/* Payment */}
                  <td className="px-4 py-4 align-top">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        isPaystack
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {isPaystack ? "Paystack" : "Bank Transfer"}
                    </span>
                  </td>

                  {/* Order Status */}
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium w-fit ${
                          isPaid
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {isPaid ? "Paid" : "Awaiting Confirmation"}
                      </span>

                      <span className="text-[11px] text-neutral-500">
                        Payment: {o.transaction_status}
                      </span>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-4 text-right font-semibold whitespace-nowrap align-top">
                    ₦
                    {Number(
                      isInstalment ? o.instalment_amount : o.total_amount,
                    ).toLocaleString()}
                  </td>

                  {/* Receipt */}
                  <td className="px-4 py-4 align-top">
                    {o.receipt_url ? (
                      <a
                        href={o.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex rounded-lg border px-3 py-2 hover:bg-neutral-100"
                      >
                        View Receipt
                      </a>
                    ) : (
                      <span className="text-xs text-neutral-400">
                        Paystack Payment
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      {showConfirmPayment && (
                        <>
                          <button
                            onClick={() => onConfirm(o.id, "bank_transfer")}
                            className="rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-700"
                          >
                            Confirm Payment
                          </button>

                          <button
                            onClick={() => onReject(o.id)}
                            className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                          >
                            Reject
                          </button>

                          <button
                            onClick={() => onCancel(o.id)}
                            className="rounded-lg bg-neutral-700 px-3 py-2 text-white hover:bg-neutral-800"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {showConfirmInstalment && (
                        <button
                          onClick={() =>
                            onConfirmInstalment({
                              orderId: o.id,
                              instalmentId: o.instalment_id,
                            })
                          }
                          className="rounded-lg bg-orange-600 px-3 py-2 text-white hover:bg-orange-700"
                        >
                          Confirm Instalment
                        </button>
                      )}

                      {showConfirmDelivery && (
                        <button
                          onClick={() => onConfirmDelivery(o.id)}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                        >
                          Confirm Delivery
                        </button>
                      )}

                      {(showConfirmPayment ||
                        showConfirmInstalment ||
                        showConfirmDelivery) && (
                        <button
                          onClick={() => onRefund?.(o)}
                          className="rounded-lg bg-yellow-600 px-3 py-2 text-white hover:bg-yellow-700"
                        >
                          Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
