"use client";

import { useEffect, useState } from "react";

import PaymentPlansTable from "@/components/PaymentPlansTable";
import PaymentHistoryTable from "@/components/PaymentHistoryTable";
import OverdueInstalmentsTable from "@/components/OverdueInstalmentsTable";
import AdminOverviewStats from "@/components/AdminOverviewStats";
import PendingConfirmationsTable from "@/components/PendingConfirmationsTable";
import NavBarAdmin from "@/components/NavBarAdmin";
import DeliveredOrdersTable from "@/components/DeliveredOrdersTable";
import PaymentRejectionsTable from "@/components/PaymentRejectionsTable";
import CancelledOrdersTable from "@/components/CancelledOrdersTable";

export default function AdminOrdersPage() {
  const [overview, setOverview] = useState(null);
  const [plans, setPlans] = useState([]);
  const [history, setHistory] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [pending, setPending] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectMessage, setRejectMessage] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [rejections, setRejections] = useState([]);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelMessage, setCancelMessage] = useState("");
  const [cancelAdminNote, setCancelAdminNote] = useState("");
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ fetch all admin data
  async function loadAdminData() {
    try {
      setLoading(true);

      const [o, p, h, d, pend, delivered, rejected, cancelled] =
        await Promise.all([
          fetch("/api/admin/overview").then((r) => r.json()),
          fetch("/api/admin/payment-plans").then((r) => r.json()),
          fetch("/api/admin/payment-history").then((r) => r.json()),
          fetch("/api/admin/overdue-instalments").then((r) => r.json()),
          fetch("/api/admin/pending-confirmations").then((r) => r.json()),
          fetch("/api/admin/delivered-orders").then((r) => r.json()),
          fetch("/api/admin/payment-rejections").then((r) => r.json()),
          fetch("/api/admin/cancelled-orders").then((r) => r.json()),
        ]);

      setOverview(o);
      setPlans(p);
      setHistory(h);
      setOverdue(d);
      setPending(pend);
      setDeliveredOrders(delivered);
      setRejections(rejected);
      setCancelledOrders(cancelled);
    } catch (error) {
      console.error("Failed to load admin dashboard:", error);
      alert("Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  // ✅ confirm payment handler
  const confirmPayment = async (orderId, paymentMethod) => {
    try {
      const res = await fetch("/api/admin/confirm-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          paymentMethod,
        }),
      });

      if (!res.ok) {
        throw new Error("Payment confirmation failed");
      }

      // refresh pending + stats
      await loadAdminData();
    } catch (error) {
      console.error(error);
      alert("Failed to confirm payment");
    }
  };

  // ✅ confirm instalment payment
  const confirmInstalmentPayment = async ({ orderId, instalmentId }) => {
    try {
      const res = await fetch("/api/admin/confirm-instalment-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          instalmentId,
        }),
      });

      if (!res.ok) {
        throw new Error("Instalment confirmation failed");
      }

      // refresh dashboard
      await loadAdminData();
    } catch (error) {
      console.error(error);
      alert("Failed to confirm instalment");
    }
  };

  //view order handler
  const viewOrder = async (orderId) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);

      if (!res.ok) {
        throw new Error("Failed to load order");
      }

      const data = await res.json();

      setSelectedOrder(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load order");
    }
  };

  //confirm delivery handler
  const confirmDelivery = async (orderId) => {
    try {
      const res = await fetch("/api/admin/confirm-delivery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
        }),
      });

      if (!res.ok) {
        throw new Error("Delivery confirmation failed");
      }

      await loadAdminData();
    } catch (error) {
      console.error(error);
      alert("Failed to confirm delivery");
    }
  };

  if (loading) {
    return <p className="p-6">Loading admin dashboard...</p>;
  }

  const rejectPayment = async () => {
    try {
      if (!rejectingOrder) {
        alert("No order selected");
        return;
      }

      if (!rejectReason) {
        alert("Please select a rejection reason");
        return;
      }

      const res = await fetch("/api/admin/reject-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: rejectingOrder,
          reason: rejectReason,
          message: rejectMessage,
          adminNote,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Reject API response:", data);

        throw new Error(
          data.error || data.details?.message || "Failed to reject payment",
        );
      }

      alert("Payment rejected successfully");

      setRejectingOrder(null);
      setRejectReason("");
      setRejectMessage("");
      setAdminNote("");

      await loadAdminData();
    } catch (error) {
      console.error("Reject payment error:", error);
      alert(error.message || "Failed to reject payment");
    }
  };

  const cancelOrder = async () => {
    try {
      if (!cancellingOrder) {
        alert("No order selected");
        return;
      }

      if (!cancelReason) {
        alert("Please select a cancellation reason");
        return;
      }

      const res = await fetch("/api/admin/cancel-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: cancellingOrder,
          reason: cancelReason,
          message: cancelMessage,
          adminNote: cancelAdminNote,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel order");
      }

      alert("Order cancelled successfully");

      setCancellingOrder(null);
      setCancelReason("");
      setCancelMessage("");
      setCancelAdminNote("");

      await loadAdminData();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <>
      <div className="space-y-8 p-6">
        <AdminOverviewStats overview={overview} />

        <section>
          <h2 className="font-bold text-xl mb-3">Payment Plans</h2>
          <PaymentPlansTable plans={plans} />
        </section>

        <section>
          <h2 className="font-bold text-xl mb-3">Payment History</h2>
          <PaymentHistoryTable history={history} onViewOrder={viewOrder} />
        </section>

        <section>
          <h2 className="font-bold text-xl text-red-600 mb-3">
            Overdue Instalments
          </h2>
          <OverdueInstalmentsTable instalments={overdue} />
        </section>

        <section>
          <h2 className="font-bold text-xl text-orange-600 mb-3">
            Pending Confirmations
          </h2>

          <PendingConfirmationsTable
            orders={pending}
            onConfirm={confirmPayment}
            onConfirmInstalment={confirmInstalmentPayment}
            onConfirmDelivery={confirmDelivery}
            onViewOrder={viewOrder}
            onReject={(orderId) => setRejectingOrder(orderId)}
            onCancel={(orderId) => setCancellingOrder(orderId)}
          />
        </section>

        <section>
          <h2 className="font-bold text-xl text-green-600 mb-3">
            Delivered Orders
          </h2>

          <DeliveredOrdersTable
            orders={deliveredOrders}
            onViewOrder={viewOrder}
          />
        </section>
        <section>
          <h2 className="font-bold text-xl text-red-600 mb-3">
            Payment Rejections
          </h2>

          <PaymentRejectionsTable
            rejections={rejections}
            onViewOrder={viewOrder}
          />
        </section>
        <section>
          <h2 className="font-bold text-xl text-gray-700 mb-3">
            Cancelled Orders
          </h2>

          <CancelledOrdersTable
            cancellations={cancelledOrders}
            onViewOrder={viewOrder}
          />
        </section>
      </div>
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h2 className="font-bold text-xl">
                Order #{selectedOrder?.id?.slice(0, 8)}
              </h2>

              <button
                onClick={() => setSelectedOrder(null)}
                className="text-red-500"
              >
                Close
              </button>
            </div>

            <p>Customer: {selectedOrder.customer?.name}</p>

            <p>Email: {selectedOrder.customer?.email}</p>

            <p>
              Status:
              <span
                className={`ml-2 px-2 py-1 rounded text-white ${
                  selectedOrder.status === "paid"
                    ? "bg-green-600"
                    : selectedOrder.status === "rejected"
                      ? "bg-red-600"
                      : selectedOrder.status === "delivered"
                        ? "bg-blue-600"
                        : "bg-yellow-600"
                }`}
              >
                {selectedOrder.status}
              </span>
            </p>
            {selectedOrder.status === "delivered" && (
              <>
                <p>
                  Delivered At:{" "}
                  {selectedOrder.delivered_at
                    ? new Date(selectedOrder.delivered_at).toLocaleString()
                    : "-"}
                </p>

                <p>
                  Delivered By: {selectedOrder.delivered_admin?.name ?? "-"}
                </p>
              </>
            )}

            <p>Total: ₦{Number(selectedOrder.total_amount).toLocaleString()}</p>

            <div className="mt-6 space-y-4">
              {selectedOrder.order_items?.map((item) => (
                <div key={item.id} className="border rounded-lg p-3 flex gap-4">
                  <img
                    src={item.store?.image}
                    alt={item.store?.title}
                    className="w-20 h-20 object-cover rounded"
                  />

                  <div>
                    <p className="font-semibold">{item.store?.title}</p>

                    <p>Quantity: {item.quantity}</p>

                    <p>₦{Number(item.price).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            {selectedOrder.payment_rejections?.length > 0 && (
              <div className="mt-6 p-4 border border-red-300 bg-red-50 rounded">
                <h3 className="font-bold text-red-700 mb-2">
                  Payment Rejection History
                </h3>

                {selectedOrder.payment_rejections.map((r) => (
                  <div key={r.id} className="mb-3">
                    <p>
                      <strong>Reason:</strong> {r.rejection_reason}
                    </p>

                    <p>
                      <strong>Message to Customer:</strong> {r.customer_message}
                    </p>
                    <p>
                      <strong>Admin Note:</strong>
                      {r.admin_note || "-"}
                    </p>

                    <p className="text-xs text-gray-500">
                      {new Date(r.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {rejectingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg">
            <h2 className="font-bold text-xl mb-4">Reject Payment</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Rejection Reason
                </label>

                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select reason</option>

                  <option value="amount_mismatch">
                    Amount paid differs from order total
                  </option>

                  <option value="payment_not_received">
                    Payment not received
                  </option>

                  <option value="invalid_receipt">
                    Invalid receipt uploaded
                  </option>

                  <option value="bank_reversal">
                    Bank reversed transaction
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Customer Message
                </label>

                <textarea
                  value={rejectMessage}
                  onChange={(e) => setRejectMessage(e.target.value)}
                  rows={4}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Admin Note (Internal Only)
                </label>

                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  className="w-full border p-2 rounded"
                  placeholder="Internal note for admins..."
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setRejectingOrder(null);
                    setRejectReason("");
                    setRejectMessage("");
                    setAdminNote("");
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={rejectPayment}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {cancellingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg">
            <h2 className="font-bold text-xl mb-4">Cancel Order</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Cancellation Reason
                </label>

                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select reason</option>

                  <option value="out_of_stock">Product Out Of Stock</option>

                  <option value="product_discontinued">
                    Product Discontinued
                  </option>

                  <option value="delivery_unavailable">
                    Delivery Unavailable
                  </option>

                  <option value="fraud_detected">Fraud Detected</option>

                  <option value="duplicate_order">Duplicate Order</option>

                  <option value="customer_requested">
                    Customer Requested Cancellation
                  </option>

                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Customer Message
                </label>

                <textarea
                  value={cancelMessage}
                  onChange={(e) => setCancelMessage(e.target.value)}
                  rows={4}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Admin Note
                </label>

                <textarea
                  value={cancelAdminNote}
                  onChange={(e) => setCancelAdminNote(e.target.value)}
                  rows={3}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setCancellingOrder(null);
                    setCancelReason("");
                    setCancelMessage("");
                    setCancelAdminNote("");
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Close
                </button>

                <button
                  onClick={cancelOrder}
                  className="px-4 py-2 bg-gray-700 text-white rounded"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
