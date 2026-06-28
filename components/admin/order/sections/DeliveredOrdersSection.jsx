"use client";

import { useMemo, useState } from "react";

import DeliveredOrdersTable from "@/components/DeliveredOrdersTable";
import DashboardSection from "../DashboardSection";
import DeliveredOrdersToolbar from "../DeliveredOrdersToolbar";
import SearchInput from "../SearchInput";

export default function DeliveredOrdersSection({ orders = [], actions }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  const filteredOrders = useMemo(() => {
    let result = Array.isArray(orders) ? [...orders] : [];

    if (search.trim()) {
      const q = search.toLowerCase();

      result = result.filter((order) =>
        [order.id, order.customer?.name, order.customer?.email, order.user_id]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(q)),
      );
    }

    const getTime = (value) => new Date(value ?? 0).getTime();

    switch (sort) {
      case "oldest":
        result.sort(
          (a, b) => getTime(a.delivered_at) - getTime(b.delivered_at),
        );
        break;

      case "highest":
        result.sort((a, b) => (b.total_amount ?? 0) - (a.total_amount ?? 0));
        break;

      case "lowest":
        result.sort((a, b) => (a.total_amount ?? 0) - (b.total_amount ?? 0));
        break;

      default:
        result.sort(
          (a, b) => getTime(b.delivered_at) - getTime(a.delivered_at),
        );
    }

    return result;
  }, [orders, search, sort]);

  return (
    <DashboardSection title="Delivered Orders" titleClassName="text-green-600">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-end">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by Order ID, Customer or Email..."
            className="w-full lg:max-w-md"
          />

          <DeliveredOrdersToolbar sort={sort} onSortChange={setSort} />
        </div>

        <DeliveredOrdersTable
          orders={filteredOrders}
          onViewOrder={actions.viewOrder}
        />
      </div>
    </DashboardSection>
  );
}
