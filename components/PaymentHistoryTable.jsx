export default function PaymentHistoryTable({ history, onViewOrder }) {
  if (!history?.length) {
    return <p className="text-sm text-neutral-500">No payments yet</p>;
  }

  return (
    <table className="w-full text-sm border mt-4">
      <thead className="bg-neutral-100">
        <tr>
          <th className="p-2 border">Order</th>
          <th className="p-2 border">User</th>
          <th className="p-2 border">Amount</th>
          <th className="p-2 border">Type</th>
          <th className="p-2 border">Method</th>
          <th className="p-2 border">Status</th>
          <th className="p-2 border">Date</th>
          <th className="p-2 border">Confirmed By</th>
          <th className="p-2 border">Confirmed At</th>
        </tr>
      </thead>

      <tbody>
        {history.map((payment) => (
          <tr key={payment.id}>
            <td className="p-2 border">
              <button
                onClick={() => onViewOrder(payment.order_id)}
                className="text-blue-600 hover:underline font-medium"
              >
                {payment.order_id?.slice(0, 8)}
              </button>
            </td>

            <td className="p-2 border">{payment.user_id?.slice(0, 8)}</td>

            <td className="p-2 border">
              ₦{Number(payment.amount).toLocaleString()}
            </td>

            <td className="p-2 border capitalize">{payment.payment_type}</td>

            <td className="p-2 border capitalize">{payment.payment_method}</td>

            <td className="p-2 border">
              <span
                className={`px-2 py-1 rounded text-white ${
                  payment.status === "completed"
                    ? "bg-green-600"
                    : "bg-yellow-600"
                }`}
              >
                {payment.status}
              </span>
            </td>

            <td className="p-2 border">
              {new Date(payment.created_at).toLocaleString()}
            </td>
            <td className="p-2 border">{payment.confirmer?.name ?? "-"}</td>

            <td className="p-2 border">
              {payment.confirmed_at
                ? new Date(payment.confirmed_at).toLocaleString()
                : "-"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
