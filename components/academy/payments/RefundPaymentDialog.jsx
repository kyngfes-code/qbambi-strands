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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(Number(value || 0));
}

export default function RefundPaymentDialog({
  open,
  onOpenChange,

  payment,

  loading = false,

  onSubmit,
}) {
  //----------------------------------------------------------

  const [amount, setAmount] = useState("");

  const [refundMethod, setRefundMethod] = useState("bank_transfer");

  const [reference, setReference] = useState("");

  const [reason, setReason] = useState("");

  //----------------------------------------------------------

  useEffect(() => {
    if (!payment) return;

    setAmount(payment.amount ?? "");

    setRefundMethod("bank_transfer");

    setReference("");

    setReason("");
  }, [payment]);

  //----------------------------------------------------------

  function handleSubmit(e) {
    e.preventDefault();

    onSubmit?.({
      paymentId: payment.id,

      amount: Number(amount),

      refund_method: refundMethod,

      refund_reference: reference,

      reason,
    });
  }

  //----------------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle>Refund Payment</DialogTitle>

            <DialogDescription>
              Record a refund for this payment.
            </DialogDescription>
          </DialogHeader>

          {/* Payment Summary */}

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
              <span>Original Payment</span>

              <span className="font-semibold">
                {formatCurrency(payment?.amount)}
              </span>
            </div>
          </div>

          {/* Refund Amount */}

          <div className="space-y-2">
            <Label>Refund Amount</Label>

            <Input
              type="number"
              min={1}
              max={payment?.amount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Refund Method */}

          <div className="space-y-2">
            <Label>Refund Method</Label>

            <Select value={refundMethod} onValueChange={setRefundMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>

                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>

                <SelectItem value="card">Card Reversal</SelectItem>

                <SelectItem value="online">Online Refund</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Refund Reference */}

          <div className="space-y-2">
            <Label>Refund Reference</Label>

            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Optional"
            />
          </div>

          {/* Reason */}

          <div className="space-y-2">
            <Label>Refund Reason</Label>

            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
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

            <Button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Process Refund"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
