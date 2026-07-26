"use client";

import Link from "next/link";
import Image from "next/image";

import OrderHeader from "./OrderHeader";
import FinancialSummary from "./FinancialSummary";
import PaymentProgress from "./PaymentProgress";
import DeliveryNotice from "./DeliveryNotice";
import StatusCard from "./StatusCard";
import PaymentSection from "./PaymentSection";
import RefundHistoryItem from "./RefundHistoryItem";

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

          {/* <OrderActions
            order={order}
            onRequestRefund={onRefund}
            hideViewDetails
          /> */}
        </div>
      </article>

      {/* Order Items */}
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="mb-6 flex items-center justify-between text-xl font-semibold">
          <span>Order Items</span>

          <span className="text-xl font-normal text-neutral-500">
            {order.order_items?.reduce(
              (sum, item) => sum + Number(item.quantity),
              0,
            )}{" "}
            Items
          </span>
        </h2>

        <div className="space-y-4">
          {order.order_items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-2xl border p-4 hover:bg-neutral-50 transition"
            >
              {/* Product Image */}
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border bg-neutral-100">
                <Image
                  src={item.store?.image || "/placeholder.png"}
                  alt={item.store?.title || "Product"}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-neutral-900">
                  {item.store?.title}
                </h3>

                <p className="mt-1 text-sm text-neutral-500">
                  Quantity: {item.quantity}
                </p>

                {item.store?.category && (
                  <p className="text-xs text-neutral-400">
                    {item.store.category}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="text-right">
                <p className="text-sm text-neutral-500">
                  ₦{Number(item.price).toLocaleString()}
                </p>

                <p className="mt-1 font-semibold">
                  ₦
                  {(
                    Number(item.price) * Number(item.quantity)
                  ).toLocaleString()}
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
      {/* {order.payment_plans && (
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
      )} */}

      {/* Refund History */}

      <div className="space-y-4">
        {order.refund_requests.map((refund) => (
          <RefundHistoryItem key={refund.id} refund={refund} />
        ))}
      </div>
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
