"use client";

import { Eye, RotateCcw, Receipt, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PaymentActions({
  payment,

  onView,

  onRefund,

  onWriteOff,

  disabled = false,
}) {
  //----------------------------------------------------------

  const status = payment?.status;

  const canRefund =
    !disabled && status !== "refunded" && status !== "written_off";

  const canWriteOff =
    !disabled && status !== "written_off" && status !== "refunded";

  //----------------------------------------------------------

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" disabled={disabled}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={() => onView?.(payment)}>
          <Eye className="mr-2 h-4 w-4" />
          View Payment
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={!canRefund}
          onClick={() => onRefund?.(payment)}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Refund Payment
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={!canWriteOff}
          onClick={() => onWriteOff?.(payment)}
        >
          <Receipt className="mr-2 h-4 w-4" />
          Write Off Balance
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
