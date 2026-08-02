"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

import { Pencil, Trash2 } from "lucide-react";

export default function PaymentPlansTable({
  rows = [],
  loading = false,
  onToggle,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center text-neutral-500">
        Loading payment plans...
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center text-neutral-500">
        No payment plans found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>

            <TableHead className="text-center">Payments</TableHead>

            <TableHead className="text-center">Initial %</TableHead>

            <TableHead className="text-center">Interest %</TableHead>

            <TableHead className="text-center">Frequency</TableHead>

            <TableHead className="text-center">Status</TableHead>

            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell className="align-top">
                <div className="max-w-[320px]">
                  <p className="font-semibold">{plan.name}</p>

                  {plan.description && (
                    <p
                      className="
          mt-1
          text-xs
          leading-5
          text-neutral-500
          whitespace-normal
          break-words
        "
                    >
                      {plan.description}
                    </p>
                  )}
                </div>
              </TableCell>

              <TableCell className="text-center">
                {plan.number_of_payments}
              </TableCell>

              <TableCell className="text-center">
                {plan.initial_payment_percentage}%
              </TableCell>

              <TableCell className="text-center">
                {plan.interest_percentage}%
              </TableCell>

              <TableCell className="text-center capitalize">
                {plan.payment_frequency}
              </TableCell>

              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-3">
                  {onToggle ? (
                    <Switch
                      checked={plan.is_active}
                      onCheckedChange={() => onToggle(plan)}
                    />
                  ) : (
                    <Badge variant={plan.active ? "default" : "secondary"}>
                      {plan.is_active ? "Active" : "Inactive"}
                    </Badge>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => onEdit?.(plan)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => onDelete?.(plan)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
