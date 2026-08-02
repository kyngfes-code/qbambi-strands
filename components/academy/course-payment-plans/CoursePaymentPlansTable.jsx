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

export default function CoursePaymentPlansTable({
  rows = [],
  loading = false,
  onEdit,
  onDelete,
  onToggleActive,
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center text-neutral-500">
        Loading course payment plans...
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center text-neutral-500">
        No course payment plans found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course</TableHead>
            <TableHead>Payment Plan</TableHead>
            <TableHead className="text-center">Default</TableHead>
            <TableHead className="text-center">Available</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{row.course?.title}</p>

                  {row.course?.slug && (
                    <p className="text-xs text-neutral-500">
                      {row.course.slug}
                    </p>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div>
                  <p className="font-medium">{row.plan?.name}</p>

                  <p className="text-xs text-neutral-500">
                    {row.plan?.number_of_payments} payments
                  </p>
                </div>
              </TableCell>

              <TableCell className="text-center">
                {row.is_default ? (
                  <Badge className="bg-blue-600">Default</Badge>
                ) : (
                  <Badge variant="secondary">No</Badge>
                )}
              </TableCell>

              <TableCell className="text-center">
                <div className="flex justify-center">
                  <Switch
                    checked={row.active}
                    onCheckedChange={(checked) =>
                      onToggleActive?.(row, checked)
                    }
                  />
                </div>
              </TableCell>

              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => onEdit?.(row)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => onDelete?.(row)}
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
