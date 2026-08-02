"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RecordPaymentDialog({
  open,
  onOpenChange,

  enrollment,

  loading = false,

  onSubmit,
}) {
  //------------------------------------------------------
  // State
  //------------------------------------------------------

  const [amount, setAmount] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("");

  const [paymentReference, setPaymentReference] = useState("");

  const [paymentDate, setPaymentDate] = useState("");

  const [notes, setNotes] = useState("");

  //------------------------------------------------------
  // Reset
  //------------------------------------------------------

  useEffect(() => {
    if (!open) return;

    setAmount("");

    setPaymentMethod("");

    setPaymentReference("");

    setPaymentDate(new Date().toISOString().split("T")[0]);

    setNotes("");
  }, [open]);

  //------------------------------------------------------
  // Calculations
  //------------------------------------------------------

  const totalFee = Number(enrollment?.total_course_fee ?? 0);

  const totalPaid = Number(enrollment?.amount_paid ?? 0);

  const balanceDue = Math.max(totalFee - totalPaid, 0);

  const paymentAmount = Number(amount || 0);

  const remainingBalance = Math.max(balanceDue - paymentAmount, 0);

  const overpayment = Math.max(paymentAmount - balanceDue, 0);

  const paymentSummary = useMemo(() => {
    if (!paymentAmount) return null;

    return {
      remainingBalance,
      overpayment,
    };
  }, [paymentAmount, remainingBalance, overpayment]);

  //------------------------------------------------------
  // Submit
  //------------------------------------------------------

  async function handleSubmit(e) {
    e.preventDefault();

    await onSubmit({
      amount: paymentAmount,

      payment_method: paymentMethod,

      payment_reference: paymentReference,

      payment_date: paymentDate,

      notes,
    });
  }

  //------------------------------------------------------

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!loading) {
          onOpenChange(value);
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>

          <DialogDescription>
            Record a payment received for this enrollment.
          </DialogDescription>
        </DialogHeader>

        {/* Student */}

        <div className="rounded-2xl border bg-neutral-50 p-5">
          <h3 className="font-semibold">
            {enrollment?.first_name} {enrollment?.last_name}
          </h3>

          <p className="mt-1 text-sm text-neutral-500">{enrollment?.email}</p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase text-neutral-500">Total Fee</p>

              <p className="mt-1 font-semibold">₦{totalFee.toLocaleString()}</p>
            </div>

            <div>
              <p className="text-xs uppercase text-neutral-500">Paid</p>

              <p className="mt-1 font-semibold text-green-600">
                ₦{totalPaid.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase text-neutral-500">Balance</p>

              <p className="mt-1 font-semibold text-red-600">
                ₦{balanceDue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            {/* Amount */}

            <div className="space-y-2">
              <Label htmlFor="amount">Amount Received *</Label>

              <Input
                id="amount"
                type="number"
                min="1"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* Method */}

            <div className="space-y-2">
              <Label>Payment Method *</Label>

              <select
                required
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-xl border px-4 py-3"
              >
                <option value="">Select Method</option>

                <option value="bank_transfer">Bank Transfer</option>

                <option value="cash">Cash</option>

                <option value="card">Card</option>

                <option value="pos">POS</option>

                <option value="online">Online Payment</option>
              </select>
            </div>

            {/* Reference */}

            <div className="space-y-2">
              <Label htmlFor="reference">Payment Reference</Label>

              <Input
                id="reference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Transaction ID"
              />
            </div>

            {/* Date */}

            <div className="space-y-2">
              <Label htmlFor="payment_date">Payment Date *</Label>

              <Input
                id="payment_date"
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>

            <textarea
              id="notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border px-4 py-3"
              placeholder="Optional internal notes..."
            />
          </div>

          {/* Summary */}

          {paymentSummary && (
            <div className="rounded-2xl border bg-neutral-50 p-6">
              <h3 className="font-semibold">Payment Summary</h3>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-neutral-500">
                    Remaining Balance
                  </p>

                  <p className="mt-1 text-xl font-bold">
                    ₦{paymentSummary.remainingBalance.toLocaleString()}
                  </p>
                </div>

                {paymentSummary.overpayment > 0 && (
                  <div>
                    <p className="text-xs uppercase text-neutral-500">
                      Overpayment
                    </p>

                    <p className="mt-1 text-xl font-bold text-orange-600">
                      ₦{paymentSummary.overpayment.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading || !paymentAmount}>
              {loading ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
