"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function AppointmentPricingHistory({ history = [] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <div>
          <h3 className="text-lg font-semibold">Pricing History</h3>

          <p className="mt-1 text-sm text-gray-500">
            View every pricing change made to this appointment.
          </p>
        </div>

        {expanded ? (
          <ChevronDown className="h-5 w-5" />
        ) : (
          <ChevronRight className="h-5 w-5" />
        )}
      </button>

      {expanded && (
        <div className="border-t">
          {history.length === 0 ? (
            <div className="p-5 text-sm text-gray-500">
              No pricing changes have been recorded.
            </div>
          ) : (
            <div className="divide-y">
              {history.map((item) => (
                <div key={item.id} className="space-y-4 p-5">
                  {/* Header */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium">
                        {new Date(item.created_at).toLocaleString()}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Changed by{" "}
                        <span className="font-medium text-gray-800">
                          {item.changed_by_user?.name ||
                            item.changed_by_user?.email ||
                            "Unknown Admin"}
                        </span>
                      </p>
                    </div>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      Pricing Updated
                    </span>
                  </div>

                  {/* Changes */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-gray-500">Service Amount</p>

                      <p>
                        ₦{Number(item.old_service_amount).toLocaleString()}
                        {" → "}₦
                        {Number(item.new_service_amount).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Deposit Required</p>

                      <p>
                        ₦{Number(item.old_deposit_required).toLocaleString()}
                        {" → "}₦
                        {Number(item.new_deposit_required).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Balance Due</p>

                      <p>
                        ₦{Number(item.old_balance_due).toLocaleString()}
                        {" → "}₦{Number(item.new_balance_due).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Amount Paid</p>

                      <p>₦{Number(item.new_amount_paid).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Reason */}
                  {item.reason && (
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Reason
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        {item.reason}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
