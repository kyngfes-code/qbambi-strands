export default function PaymentHistoryTable({ history }) {
  if (!history.length) {
    return <p className="text-sm text-neutral-500">No payments yet</p>;
  }

  return (
    <table className="w-full text-sm border mt-4">
      <thead className="bg-neutral-100">
        <tr>
          <th className="p-2 border">Plan</th>
          <th className="p-2 border">User</th>
          <th className="p-2 border">Amount Paid</th>
          <th className="p-2 border">Paid At</th>
        </tr>
      </thead>
      <tbody>
        {history.map((h) => (
          <tr key={h.id}>
            <td className="p-2 border">{h.payment_plans?.id}</td>
            <td className="p-2 border">{h.payment_plans?.user_id}</td>
            <td className="p-2 border">₦{h.amount_paid.toLocaleString()}</td>
            <td className="p-2 border">
              {new Date(h.paid_at).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
