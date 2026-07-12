export default function LatestPaymentCard({ payment }) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <h2 className="font-semibold">Latest Payment</h2>

      {payment?.amount ? (
        <>
          <p className="mt-4">{payment.type}</p>

          <p>₦{Number(payment.amount).toLocaleString()}</p>
        </>
      ) : (
        <p className="mt-4 text-neutral-500">No payment history.</p>
      )}
    </div>
  );
}
