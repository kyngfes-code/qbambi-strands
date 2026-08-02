"use client";

import { useEffect, useState } from "react";

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
import { Textarea } from "@/components/ui/textarea";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(Number(value || 0));
}

export default function WriteOffDialog({
  open,
  onOpenChange,

  payment,

  loading = false,

  onSubmit,
}) {
  //----------------------------------------------------------

  const [amount, setAmount] = useState("");

  const [reason, setReason] = useState("");

  //----------------------------------------------------------

  useEffect(() => {
    if (!payment) return;

    setAmount(payment.balance_due ?? payment.outstanding_balance ?? 0);

    setReason("");
  }, [payment]);

  //----------------------------------------------------------

  function handleSubmit(e) {
    e.preventDefault();

    onSubmit?.({
      paymentId: payment.id,

      amount: Number(amount),

      reason,
    });
  }

  //----------------------------------------------------------

  const outstanding = payment?.balance_due ?? payment?.outstanding_balance ?? 0;

  //----------------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle>Write Off Outstanding Balance</DialogTitle>

            <DialogDescription>
              Permanently forgive part or all of the student's outstanding
              balance. This action should only be used with management approval.
            </DialogDescription>
          </DialogHeader>

          {/* Summary */}

          <div className="rounded-lg border bg-neutral-50 p-4 text-sm">
            <div className="flex justify-between">
              <span>Student</span>

              <span className="font-medium">
                {payment?.enrollment?.first_name}{" "}
                {payment?.enrollment?.last_name}
              </span>
            </div>

            <div className="mt-2 flex justify-between">
              <span>Enrollment</span>

              <span className="font-medium">
                {payment?.enrollment?.enrollment_number}
              </span>
            </div>

            <div className="mt-2 flex justify-between">
              <span>Outstanding Balance</span>

              <span className="font-semibold text-red-600">
                {formatCurrency(outstanding)}
              </span>
            </div>
          </div>

          {/* Amount */}

          <div className="space-y-2">
            <Label>Amount to Write Off</Label>

            <Input
              type="number"
              min={1}
              max={outstanding}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Reason */}

          <div className="space-y-2">
            <Label>Reason</Label>

            <Textarea
              rows={5}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this balance is being written off..."
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading} variant="destructive">
              {loading ? "Processing..." : "Write Off Balance"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
