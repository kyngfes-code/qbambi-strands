export default function LatestOrderCard({ order }) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <h2 className="font-semibold">Latest Order</h2>

      {order?.id ? (
        <>
          <p className="mt-4">Status: {order.status}</p>

          <p className="text-sm text-neutral-500">
            ₦{Number(order.total_amount).toLocaleString()}
          </p>
        </>
      ) : (
        <p className="mt-4 text-neutral-500">No orders yet.</p>
      )}
    </div>
  );
}
