"use client";

import { useState } from "react";

export default function useOrderActions(loadAdminData) {
  // =====================================================
  // Order Details Modal
  // =====================================================

  const [selectedOrder, setSelectedOrder] = useState(null);

  // =====================================================
  // Reject Payment Modal
  // =====================================================

  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectMessage, setRejectMessage] = useState("");
  const [adminNote, setAdminNote] = useState("");

  // =====================================================
  // Cancel Order Modal
  // =====================================================

  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelMessage, setCancelMessage] = useState("");
  const [cancelAdminNote, setCancelAdminNote] = useState("");

  const [refundOrder, setRefundOrder] = useState(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refundCustomerMessage, setRefundCustomerMessage] = useState("");
  const [refundAdminNote, setRefundAdminNote] = useState("");

  const openRefundModal = async (order) => {
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`);

      if (!res.ok) {
        throw new Error("Failed to load order");
      }

      const fullOrder = await res.json();

      setRefundOrder(fullOrder);
    } catch (err) {
      console.error(err);
      alert("Failed to load refund information.");
    }
  };

  const closeRefundModal = () => {
    setRefundOrder(null);

    setRefundAmount("");
    setRefundReason("");
    setRefundCustomerMessage("");
    setRefundAdminNote("");
  };

  const submitRefund = async () => {
    try {
      if (!refundOrder) {
        alert("No order selected");
        return;
      }

      if (!refundAmount || Number(refundAmount) <= 0) {
        alert("Enter a valid refund amount");
        return;
      }

      const res = await fetch("/api/admin/refunds/orders/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: refundOrder.id,
          amount: Number(refundAmount),
          reason: refundReason,
          customerMessage: refundCustomerMessage,
          adminNote: refundAdminNote,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Refund failed");
      }

      alert("Refund recorded successfully");

      // const orderId = refundOrder.id;

      await loadAdminData();
      closeRefundModal();

      await Promise.all([loadAdminData()]);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // =====================================================
  // View Order
  // =====================================================

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

  // =====================================================
  // Confirm Full Payment
  // =====================================================

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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Payment confirmation failed");
      }

      await loadAdminData();
    } catch (error) {
      console.error(error);
      alert("Failed to confirm payment");
    }
  };

  // =====================================================
  // Confirm Instalment
  // =====================================================

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

      await loadAdminData();
    } catch (error) {
      console.error(error);
      alert("Failed to confirm instalment");
    }
  };

  // =====================================================
  // Confirm Delivery
  // =====================================================

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

  // =====================================================
  // Reject Payment
  // =====================================================

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
        throw new Error(
          data.error || data.details?.message || "Failed to reject payment",
        );
      }

      alert("Payment rejected successfully");

      closeRejectModal();

      await loadAdminData();
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to reject payment");
    }
  };

  // =====================================================
  // Cancel Order
  // =====================================================

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

      closeCancelModal();

      await loadAdminData();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // =====================================================
  // Modal Helpers
  // =====================================================

  const closeOrderModal = () => {
    setSelectedOrder(null);
  };

  const closeRejectModal = () => {
    setRejectingOrder(null);
    setRejectReason("");
    setRejectMessage("");
    setAdminNote("");
  };

  const closeCancelModal = () => {
    setCancellingOrder(null);
    setCancelReason("");
    setCancelMessage("");
    setCancelAdminNote("");
  };

  // =====================================================
  // Return
  // =====================================================

  return {
    actions: {
      confirmPayment,
      confirmInstalmentPayment,
      confirmDelivery,

      viewOrder,

      rejectOrder: setRejectingOrder,

      cancelOrder: setCancellingOrder,
      openRefundModal,
    },

    details: {
      order: selectedOrder,
      open: viewOrder,
      close: closeOrderModal,
    },

    rejection: {
      orderId: rejectingOrder,
      reason: rejectReason,
      message: rejectMessage,
      adminNote,

      setReason: setRejectReason,
      setMessage: setRejectMessage,
      setAdminNote,

      open: setRejectingOrder,
      close: closeRejectModal,

      submit: rejectPayment,
    },

    cancellation: {
      orderId: cancellingOrder,
      reason: cancelReason,
      message: cancelMessage,
      adminNote: cancelAdminNote,

      setReason: setCancelReason,
      setMessage: setCancelMessage,
      setAdminNote: setCancelAdminNote,

      open: setCancellingOrder,
      close: closeCancelModal,

      submit: cancelOrder,
    },

    refund: {
      order: refundOrder,

      amount: refundAmount,
      reason: refundReason,
      customerMessage: refundCustomerMessage,
      adminNote: refundAdminNote,

      setAmount: setRefundAmount,
      setReason: setRefundReason,
      setCustomerMessage: setRefundCustomerMessage,
      setAdminNote: setRefundAdminNote,

      open: openRefundModal,
      close: closeRefundModal,

      submit: submitRefund,
    },
  };
}
