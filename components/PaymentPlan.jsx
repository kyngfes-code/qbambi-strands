"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PaymentPlan({ order, onPlanCreated }) {
  const [paymentPlan, setPaymentPlan] = useState("full");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const router = useRouter();

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
      title: "2 Installments (30 days)",
      penaltyPercent: 5,
      finalTotal: twoInstallmentTotal,
      rules: [
        "First installment confirms the order",
        "Second installment must be paid within 30 days",
      ],
      installments: [
        { label: "First payment (50%)", amount: twoInstallmentTotal * 0.5 },
        { label: "Second payment (50%)", amount: twoInstallmentTotal * 0.5 },
      ],
    },

    three_installments: {
      title: "3 Installments (60 days)",
      penaltyPercent: 7,
      finalTotal: threeInstallmentTotal,
      rules: [
        "First installment confirms the order",
        "Remaining payments must be completed within 60 days",
      ],
      installments: [
        { label: "First payment (40%)", amount: threeInstallmentTotal * 0.4 },
        { label: "Second payment (30%)", amount: threeInstallmentTotal * 0.3 },
        { label: "Final payment (30%)", amount: threeInstallmentTotal * 0.3 },
      ],
    },
  };

  const selected = plans[paymentPlan];

  const numOfMonths = {
    full: null,
    two_installments: 1,
    three_installments: 2,
  };

  const createPaymentPlan = async () => {
    setError(null);

    if (paymentPlan === "full") {
      // No payment plan needed
      onPlanCreated?.(); //redirect to payment page
      return;
    }

    setLoading(true);

    const months = numOfMonths[paymentPlan];

    try {
      const res = await fetch("/api/payment-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          months,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create payment plan");
      }

      const firstInstalment = selected.installments[0].amount;
      const totalPayable = selected.finalTotal;

      const payload = {
        first: Math.round(firstInstalment),
        next: data.next_instalment_amount,
        total: Math.round(totalPayable),
        nextInstalmentId: data.next_instalment_id,
      };

      setSuccessMessage(payload);

      // 🔒 persist per-order
      localStorage.setItem(
        `payment_plan_success_${order.id}`,
        JSON.stringify(payload)
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!order?.id) return;

    const stored = localStorage.getItem(`payment_plan_success_${order.id}`);

    // restore if plan exists AND first instalment not yet paid
    if (stored && order.payment_plan?.next_instalment_id) {
      try {
        setSuccessMessage(JSON.parse(stored));
      } catch {
        localStorage.removeItem(`payment_plan_success_${order.id}`);
      }
    }
  }, [order?.id, order?.payment_plan?.next_instalment_id]);

  useEffect(() => {
    // once there is no next instalment, first payment is done
    if (!order.payment_plan?.next_instalment_id) {
      localStorage.removeItem(`payment_plan_success_${order.id}`);
      setSuccessMessage(null);
    }
  }, [order.payment_plan?.next_instalment_id, order.id]);

  function getTimeRemaining(dueDate) {
    const diff = new Date(dueDate) - new Date();

    if (diff <= 0) return "Overdue";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

    return `${days} days ${hours} hours`;
  }

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
                  onChange={() => {
                    setPaymentPlan(key);
                    setSuccessMessage(null);
                    setError(null);
                  }}
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
                  <button
                    onClick={createPaymentPlan}
                    disabled={loading || successMessage}
                    className="w-full py-2 bg-black text-white rounded-lg mt-4 disabled:opacity-50"
                  >
                    {loading
                      ? "Setting up plan..."
                      : paymentPlan !== "full" && successMessage
                      ? "Payment plan created"
                      : paymentPlan === "full"
                      ? "Continue with full payment"
                      : "Continue with this payment plan"}
                  </button>
                  {paymentPlan === key && successMessage && (
                    <div className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200">
                      <p className="text-green-800 font-medium">
                        Kindly proceed to make your first instalment of{" "}
                        <span className="font-bold">
                          ₦{successMessage.first.toLocaleString()}
                        </span>{" "}
                        out of{" "}
                        <span className="font-bold">
                          ₦{successMessage.total.toLocaleString()}
                        </span>{" "}
                        total amount payable. next instalment{" "}
                        <span className="font-bold">
                          ₦{successMessage.next}
                        </span>{" "}
                      </p>
                      <button
                        disabled={!successMessage?.nextInstalmentId}
                        onClick={() =>
                          router.push(
                            `/payments/instalment/${successMessage.nextInstalmentId}`
                          )
                        }
                        className="w-full py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
                      >
                        Pay first instalment now
                      </button>
                    </div>
                  )}

                  {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
              )}
            </label>
          ))}
          {order.payment_plan?.next_instalment_due_date && (
            <p className="text-sm text-orange-600">
              Next instalment due on{" "}
              {new Date(
                order.payment_plan.next_instalment_due_date
              ).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </>
  );
}
