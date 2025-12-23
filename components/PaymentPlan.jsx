"use client";

import { useState } from "react";

export default function PaymentPlan({ order }) {
  const [paymentPlan, setPaymentPlan] = useState("full");

  const addPercentage = (amount, percent) => amount + amount * (percent / 100);
  const percentage2installments = 5;
  const percentage3installments = 7;
  const total = Number(order?.total_amount ?? 0);
  const twoInstallmentTotal = addPercentage(total, percentage2installments);
  const threeInstallmentTotal = addPercentage(total, percentage3installments);

  const plans = {
    full: {
      title: "Full Payment",
      penaltyPercent: 0,
      finalTotal: total,
      rules: [
        "Payment must be completed immediately",
        "No additional charges apply",
        "Order processing starts after payment confirmation",
      ],
      installments: [{ label: "One-time payment", amount: total }],
    },

    two_installments: {
      title: "2 Installments (60 days)",
      penaltyPercent: 5,
      finalTotal: twoInstallmentTotal,
      rules: [
        "First installment confirms the order",
        "Second installment must be paid within 60 days",
      ],
      installments: [
        { label: "First payment (50%)", amount: twoInstallmentTotal * 0.5 },
        { label: "Second payment (50%)", amount: twoInstallmentTotal * 0.5 },
      ],
    },

    three_installments: {
      title: "3 Installments (90 days)",
      penaltyPercent: 7,
      finalTotal: threeInstallmentTotal,
      rules: [
        "First installment confirms the order",
        "Remaining payments must be completed within 90 days",
      ],
      installments: [
        { label: "First payment (40%)", amount: threeInstallmentTotal * 0.4 },
        { label: "Second payment (30%)", amount: threeInstallmentTotal * 0.3 },
        { label: "Final payment (30%)", amount: threeInstallmentTotal * 0.3 },
      ],
    },
  };

  const selected = plans[paymentPlan];

  return (
    <>
      {order.status === "pending" && (
        <div className="border rounded-xl p-4 space-y-4">
          <p className="font-semibold">Choose Payment Plan</p>

          {/* RADIO OPTIONS */}
          {Object.entries(plans).map(([key, plan]) => (
            <label key={key} className="flex flex-col gap-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentPlan"
                  value={key}
                  checked={paymentPlan === key}
                  onChange={() => setPaymentPlan(key)}
                />
                <span className="font-medium">{plan.title}</span>
                {plan.penaltyPercent > 0 && (
                  <span className="text-sm text-neutral-500">
                    — +{plan.penaltyPercent}%
                  </span>
                )}
              </div>

              {paymentPlan === key && (
                <div className="ml-6 mt-2 p-4 bg-neutral-50 border rounded-lg space-y-4 text-sm">
                  {/* RULES */}
                  <div>
                    <p className="font-semibold mb-1">Rules & Conditions</p>
                    <ul className="list-disc list-inside text-neutral-600 space-y-1">
                      {plan.rules.map((rule, idx) => (
                        <li key={idx}>{rule}</li>
                      ))}
                    </ul>
                  </div>

                  {/* TOTAL */}
                  <div>
                    <p className="font-semibold">Total Amount Payable</p>
                    <p className="text-lg font-bold">
                      ₦{selected.finalTotal.toLocaleString()}
                    </p>
                  </div>

                  {/* INSTALLMENTS */}
                  <div>
                    <p className="font-semibold mb-1">Installment Breakdown</p>
                    <ul className="space-y-1">
                      {plan.installments.map((i, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{i.label}</span>
                          <span className="font-medium">
                            ₦{Math.round(i.amount).toLocaleString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* PENALTY */}
                  {plan.penaltyPercent > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="font-semibold text-yellow-800">
                        Late Payment Penalty
                      </p>
                      <p className="text-yellow-700">
                        {plan.penaltyPercent}% per missed installment
                      </p>
                    </div>
                  )}
                </div>
              )}
            </label>
          ))}
        </div>
      )}
    </>
  );
}
