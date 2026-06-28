"use client";

import OrderDetailsModal from "@/components/admin/order/OrderDetailsModal";
import AdminOrdersContent from "@/components/admin/order/AdminOrdersContent";
import RejectPaymentModal from "@/components/admin/order/RejectPaymentModal";
import CancelOrderModal from "@/components/admin/order/CancelOrderModal";

import useAdminOrders from "@/hooks/useAdminOrders";
import useOrderActions from "@/hooks/useOrderActions";
import PageSpinner from "@/components/PageSpinner";

export default function AdminOrdersPage() {
  const { loading, refreshing, data, period, setPeriod, refresh } =
    useAdminOrders();

  const { actions, details, rejection, cancellation } =
    useOrderActions(refresh);

  if (loading) {
    return <PageSpinner text="loading" />;
  }

  return (
    <>
      <AdminOrdersContent
        data={data}
        actions={{
          ...actions,
          period,
          setPeriod,
          refresh,
          refreshing,
        }}
      />

      <OrderDetailsModal order={details.order} onClose={details.close} />

      <RejectPaymentModal
        isOpen={!!rejection.orderId}
        rejectReason={rejection.reason}
        setRejectReason={rejection.setReason}
        rejectMessage={rejection.message}
        setRejectMessage={rejection.setMessage}
        adminNote={rejection.adminNote}
        setAdminNote={rejection.setAdminNote}
        onClose={rejection.close}
        onConfirm={rejection.submit}
      />

      <CancelOrderModal
        isOpen={!!cancellation.orderId}
        cancelReason={cancellation.reason}
        setCancelReason={cancellation.setReason}
        cancelMessage={cancellation.message}
        setCancelMessage={cancellation.setMessage}
        cancelAdminNote={cancellation.adminNote}
        setCancelAdminNote={cancellation.setAdminNote}
        onClose={cancellation.close}
        onConfirm={cancellation.submit}
      />
    </>
  );
}
