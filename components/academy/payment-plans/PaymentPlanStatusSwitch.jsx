"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";

export default function PaymentPlanStatusSwitch({ plan, onUpdated }) {
  const [loading, setLoading] = useState(false);

  async function handleChange(value) {
    try {
      setLoading(true);

      const res = await fetch(`/api/admin/academy/payment-plans/${plan.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: value,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      onUpdated?.();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Switch
        checked={plan.active}
        disabled={loading}
        onCheckedChange={handleChange}
      />

      <span
        className={`text-sm font-medium ${
          plan.active ? "text-green-600" : "text-neutral-500"
        }`}
      >
        {plan.active ? "Active" : "Inactive"}
      </span>
    </div>
  );
}
