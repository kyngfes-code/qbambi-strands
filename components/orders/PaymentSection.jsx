"use client";

import PaymentMethodSelector from "@/components/payments/PaymentMethodSelector";

export default function PaymentSection({ order, balanceDue, onReload }) {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Complete Payment</h2>

          <p className="mt-1 text-sm text-neutral-500">
            Complete the outstanding balance using your preferred payment
            method.
          </p>
        </div>

        <div className="rounded-xl bg-neutral-100 px-4 py-3 text-center sm:text-right">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Outstanding Balance
          </p>

          <p className="mt-1 text-xl font-bold">
            ₦{balanceDue.toLocaleString()}
          </p>
        </div>
      </div>

      <PaymentMethodSelector
        entityType={order.payment_plan ? "instalment" : "order"}
        entityId={
          order.payment_plan ? order.payment_plan.next_instalment_id : order.id
        }
        paymentType={order.payment_plan ? "instalment" : "full_payment"}
        amount={
          order.payment_plan
            ? order.payment_plan.next_instalment_amount
            : balanceDue
        }
        customerEmail={order.user?.email}
        customerName={order.user?.name}
        onUploadReceipt={onReload}
      />
    </section>
  );
}
