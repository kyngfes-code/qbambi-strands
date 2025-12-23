"use client";

export default function OverdueInstalmentsTable({ instalments = [] }) {
  if (!instalments.length) {
    return (
      <p className="text-sm text-neutral-500 mt-2">No overdue instalments 🎉</p>
    );
  }

  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full text-sm border">
        <thead className="bg-neutral-100">
          <tr>
            <th className="p-2 border">Plan ID</th>
            <th className="p-2 border">User ID</th>
            <th className="p-2 border">Due Date</th>
            <th className="p-2 border">Amount</th>
            <th className="p-2 border">Paid</th>
            <th className="p-2 border">Penalties</th>
            <th className="p-2 border">Outstanding</th>
          </tr>
        </thead>

        <tbody>
          {instalments.map((i) => {
            const outstanding = i.amount - i.amount_paid;

            return (
              <tr key={i.id} className="border-t">
                <td className="p-2 border">{i.payment_plans?.id}</td>
                <td className="p-2 border">{i.payment_plans?.user_id}</td>
                <td className="p-2 border">
                  {new Date(i.due_date).toLocaleDateString()}
                </td>
                <td className="p-2 border">₦{i.amount.toLocaleString()}</td>
                <td className="p-2 border">
                  ₦{i.amount_paid.toLocaleString()}
                </td>
                <td className="p-2 border text-center">
                  {i.penalty_applied_count}
                </td>
                <td className="p-2 border font-semibold text-red-600">
                  ₦{outstanding.toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
