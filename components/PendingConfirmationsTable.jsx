"use client";

export default function PendingConfirmationsTable({
  orders = [],
  onConfirm,
  onConfirmInstalment,
  onConfirmDelivery,
  onViewOrder,
  onReject,
  onCancel,
}) {
  if (!orders.length) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center text-neutral-500">
        No pending confirmations.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1250px] w-full text-sm">
          <thead className="bg-neutral-100">
            <tr className="text-left">
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Payment</th>
              <th className="px-4 py-3 font-semibold text-right">Amount</th>
              <th className="px-4 py-3 font-semibold">Receipt</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => {
              const isInstalment = o.type === "instalment";

              return (
                <tr
                  key={`${o.id}-${o.instalment_id ?? "full"}`}
                  className="border-t hover:bg-neutral-50 transition"
                >
                  {/* Order */}
                  <td className="px-4 py-4">
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
                  <td className="px-4 py-4">
                    <div className="font-medium">{o.customer?.name ?? "-"}</div>

                    <div className="text-xs text-neutral-500">
                      {o.customer?.email ?? "-"}
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    {o.customer?.phone ?? "-"}
                  </td>

                  {/* Payment Method */}
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        o.payment_method === "paystack"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {o.payment_method === "paystack"
                        ? "Paystack"
                        : "Bank Transfer"}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-4 text-right font-semibold whitespace-nowrap">
                    ₦
                    {Number(
                      isInstalment ? o.instalment_amount : o.total_amount,
                    ).toLocaleString()}
                  </td>

                  {/* Receipt */}
                  <td className="px-4 py-4">
                    <a
                      href={o.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex rounded-lg border px-3 py-2 hover:bg-neutral-100"
                    >
                      View Receipt
                    </a>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    {o.status === "paid" ? (
                      <button
                        onClick={() => onConfirmDelivery(o.id)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                      >
                        Confirm Delivery
                      </button>
                    ) : isInstalment ? (
                      <button
                        onClick={() =>
                          onConfirmInstalment({
                            orderId: o.id,
                            instalmentId: o.instalment_id,
                          })
                        }
                        className="rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
                      >
                        Confirm Instalment
                      </button>
                    ) : (
                      <div className="flex flex-wrap gap-2">
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
                      </div>
                    )}
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
