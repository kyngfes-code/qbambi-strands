export default function PaymentPlansTable({ plans }) {
  if (!plans.length) {
    return <p className="text-sm text-neutral-500">No payment plans</p>;
  }

  return (
    <table className="w-full text-sm border mt-4">
      <thead className="bg-neutral-100">
        <tr>
          <th className="p-2 border">Plan ID</th>
          <th className="p-2 border">User</th>
          <th className="p-2 border">Amount</th>
          <th className="p-2 border">Duration</th>
          <th className="p-2 border">Status</th>
          <th className="p-2 border">Created</th>
        </tr>
      </thead>
      <tbody>
        {plans.map((p) => (
          <tr key={p.id}>
            <td className="p-2 border">{p.id}</td>
            <td className="p-2 border">{p.user_id}</td>
            <td className="p-2 border">₦{p.total_amount.toLocaleString()}</td>
            <td className="p-2 border">{p.duration_months} months</td>
            <td className="p-2 border">{p.status}</td>
            <td className="p-2 border">
              {new Date(p.created_at).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
