"use client";

export default function PaymentHistoryTable({ history, onViewOrder }) {
  if (!history?.length) {
    return (
      <div className="rounded-xl border bg-white p-6 text-center text-neutral-500">
        No payments yet
      </div>
    );
  }

  const statusStyles = {
    confirmed: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
      <table className="min-w-[1400px] w-full text-sm">
        <thead className="bg-neutral-100">
          <tr>
            <th className="border-b p-3 text-left">Order</th>

            <th className="border-b p-3 text-left">Customer</th>

            <th className="border-b p-3 text-left ">Email</th>

            <th className="border-b p-3 text-left ">Phone</th>

            <th className="border-b p-3 text-right">Amount</th>

            <th className="border-b p-3 text-left ">Type</th>

            <th className="border-b p-3 text-left ">Method</th>

            <th className="border-b p-3 text-center">Status</th>

            <th className="border-b p-3 text-left ">Payment Date</th>

            <th className="border-b p-3 text-left ">Confirmed By</th>

            <th className="border-b p-3 text-left ">Confirmed At</th>
          </tr>
        </thead>

        <tbody>
          {history.map((payment) => (
            <tr
              key={payment.id}
              className="border-b last:border-0 hover:bg-neutral-50"
            >
              <td className="p-3">
                <button
                  onClick={() => onViewOrder(payment.order_id)}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {payment.order_id?.slice(0, 8)}
                </button>
              </td>

              <td className="p-3 font-medium">
                {payment.customer?.name ?? "-"}
              </td>

              <td className="p-3 ">{payment.customer?.email ?? "-"}</td>

              <td className="p-3 ">{payment.customer?.phone ?? "-"}</td>

              <td className="p-3 text-right font-medium whitespace-nowrap">
                ₦{Number(payment.amount ?? 0).toLocaleString()}
              </td>

              <td className="p-3 capitalize ">{payment.payment_type}</td>

              <td className="p-3 capitalize ">
                {payment.payment_method?.replace("_", " ")}
              </td>

              <td className="p-3 text-center">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    statusStyles[payment.status] ??
                    "bg-neutral-100 text-neutral-700"
                  }`}
                >
                  {payment.status}
                </span>
              </td>

              <td className="p-3 whitespace-nowrap ">
                {new Date(payment.created_at).toLocaleString()}
              </td>

              <td className="p-3 ">{payment.confirmer?.name ?? "-"}</td>

              <td className="p-3 whitespace-nowrap ">
                {payment.confirmed_at
                  ? new Date(payment.confirmed_at).toLocaleString()
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
