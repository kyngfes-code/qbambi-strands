"use client";

import Link from "next/link";

import OrderHeader from "./OrderHeader";
import FinancialSummary from "./FinancialSummary";
import PaymentProgress from "./PaymentProgress";
import DeliveryNotice from "./DeliveryNotice";
import StatusCard from "./StatusCard";
import PaymentSection from "./PaymentSection";
import OrderActions from "./OrderActions";

export default function OrderDetailsView({ order, onReload, onRefund }) {
  const total = Number(order.total_amount || 0);

  const refunded = Number(order.refunded_amount || 0);

  const paid =
    order.status === "paid" ||
    order.status === "delivered" ||
    order.status === "payment_plan_active"
      ? total
      : 0;

  const balanceDue = Math.max(total - paid, 0);

  const netPaid = Math.max(paid - refunded, 0);

  const showPaymentSection =
    balanceDue > 0 &&
    (order.status === "pending" ||
      order.status === "rejected" ||
      (order.status === "payment_plan_active" &&
        order.payment_plan?.status === "active"));

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-black"
      >
        ← Back to Orders
      </Link>

      {/* Main Card */}
      <article className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="space-y-8 p-6 lg:p-8">
          <OrderHeader order={order} />

          <FinancialSummary
            total={total}
            paid={paid}
            netPaid={netPaid}
            refunded={refunded}
            balanceDue={balanceDue}
          />

          <PaymentProgress total={total} paid={paid} />

          <DeliveryNotice />

          {showPaymentSection && (
            <PaymentSection
              order={order}
              balanceDue={balanceDue}
              onReload={onReload}
            />
          )}

          <StatusCard order={order} />

          <OrderActions order={order} onRequestRefund={onRefund} />
        </div>
      </article>

      {/* Order Items */}
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold">Order Items</h2>

        <div className="space-y-5">
          {order.order_items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 border-b pb-5 last:border-none last:pb-0"
            >
              <div className="min-w-0">
                <h3 className="font-semibold">{item.store?.name}</h3>

                <p className="mt-1 text-sm text-neutral-500">
                  Qty: {item.quantity}
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold">
                  ₦{Number(item.price).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shipping Address */}
      {order.addresses && (
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold">Shipping Address</h2>

          <div className="space-y-1 text-sm text-neutral-700">
            <p>{order.addresses.full_name}</p>

            <p>{order.addresses.phone}</p>

            <p>{order.addresses.address}</p>

            <p>
              {order.addresses.city}, {order.addresses.state}
            </p>

            <p>{order.addresses.country}</p>
          </div>
        </section>
      )}

      {/* Payment Plan */}
      {order.payment_plans && (
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold">Payment Plan</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard label="Status" value={order.payment_plans.status} />

            <InfoCard
              label="Original Price"
              value={`₦${Number(
                order.payment_plans.original_price || 0,
              ).toLocaleString()}`}
            />

            <InfoCard
              label="Amount Paid"
              value={`₦${Number(
                order.payment_plans.amount_paid || 0,
              ).toLocaleString()}`}
            />

            <InfoCard
              label="Installments"
              value={order.payment_plans.instalments?.length || 0}
            />
          </div>

          {order.payment_plans.instalments?.length > 0 && (
            <div className="mt-8 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 text-left">Due Date</th>

                    <th className="py-3 text-left">Amount</th>

                    <th className="py-3 text-left">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {order.payment_plans.instalments.map((instalment) => (
                    <tr key={instalment.id} className="border-b">
                      <td className="py-3">{instalment.due_date}</td>

                      <td className="py-3">
                        ₦{Number(instalment.amount).toLocaleString()}
                      </td>

                      <td className="py-3 capitalize">{instalment.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Refund History */}
      {order.refunds?.length > 0 && (
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold">Refund History</h2>

          <div className="space-y-4">
            {order.refunds.map((refund) => (
              <div key={refund.id} className="rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">
                    {refund.status}
                  </span>

                  <span className="font-semibold text-red-600">
                    ₦{Number(refund.amount || 0).toLocaleString()}
                  </span>
                </div>

                {refund.reason && (
                  <p className="mt-2 text-sm text-neutral-500">
                    {refund.reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border bg-neutral-50 p-4">
      <p className="text-xs uppercase tracking-wide text-neutral-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}
