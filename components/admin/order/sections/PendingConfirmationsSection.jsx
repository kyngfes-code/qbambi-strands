"use client";

import { useMemo, useState } from "react";

import DashboardSection from "../DashboardSection";
import PendingConfirmationsToolbar from "../PendingConfirmationsToolbar";
import PendingConfirmationsTable from "@/components/PendingConfirmationsTable";
import SearchInput from "../SearchInput";

export default function PendingConfirmationsSection({ orders = [], actions }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [status, setStatus] = useState("all");

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (search.trim()) {
      const q = search.toLowerCase();

      result = result.filter((order) =>
        [
          order.id,
          order.customer?.name,
          order.customer?.email,
          order.customer?.phone,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(q)),
      );
    }

    if (status !== "all") {
      result = result.filter((o) => o.status === status);
    }

    const getTime = (value) => new Date(value ?? 0).getTime();

    switch (sort) {
      case "oldest":
        result.sort((a, b) => getTime(a.created_at) - getTime(b.created_at));
        break;

      case "highest":
        result.sort((a, b) => (b.total_amount ?? 0) - (a.total_amount ?? 0));
        break;

      case "lowest":
        result.sort((a, b) => (a.total_amount ?? 0) - (b.total_amount ?? 0));
        break;

      default:
        result.sort((a, b) => getTime(b.created_at) - getTime(a.created_at));
    }

    return result;
  }, [orders, search, status, sort]);

  return (
    <DashboardSection
      title="Pending Confirmations"
      titleClassName="text-orange-600"
      description="Payments awaiting admin approval."
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-end">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by Order ID, Customer, Email or Phone..."
            className="w-full lg:max-w-md"
          />

          <PendingConfirmationsToolbar
            status={status}
            onStatusChange={setStatus}
            sort={sort}
            onSortChange={setSort}
          />
        </div>

        <PendingConfirmationsTable
          orders={filteredOrders}
          onConfirm={actions.confirmPayment}
          onConfirmInstalment={actions.confirmInstalmentPayment}
          onConfirmDelivery={actions.confirmDelivery}
          onViewOrder={actions.viewOrder}
          onReject={actions.rejectOrder}
          onCancel={actions.cancelOrder}
        />
      </div>
    </DashboardSection>
  );
}
