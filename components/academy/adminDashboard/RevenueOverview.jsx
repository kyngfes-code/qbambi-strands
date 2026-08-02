"use client";

import { ArrowDownRight, ArrowUpRight, DollarSign } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

//////////////////////////////////////////////////////////////

function formatCurrency(amount = 0) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

//////////////////////////////////////////////////////////////

export default function RevenueOverview({ stats = {}, loading = false }) {
  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="space-y-5 p-6">
          <div className="h-6 w-48 animate-pulse rounded bg-neutral-100" />

          <div className="h-10 w-56 animate-pulse rounded bg-neutral-100" />

          <div className="h-3 w-full animate-pulse rounded bg-neutral-100" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-24 animate-pulse rounded-xl bg-neutral-100" />
            <div className="h-24 animate-pulse rounded-xl bg-neutral-100" />
          </div>
        </CardContent>
      </Card>
    );
  }

  ////////////////////////////////////////////////////////////

  const totalRevenue = Number(stats.totalRevenue || 0);

  const outstanding = Number(stats.outstandingBalance || 0);

  const refunded = Number(stats.totalRefunded || 0);

  const writtenOff = Number(stats.totalWrittenOff || 0);

  const totalExpected = totalRevenue + outstanding;

  const collectionRate =
    totalExpected === 0 ? 0 : Math.round((totalRevenue / totalExpected) * 100);

  const monthlyGrowth = Number(stats.monthlyGrowth || 0);

  ////////////////////////////////////////////////////////////

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="space-y-6 p-6">
        {/* Header */}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Revenue Overview</h2>

            <p className="mt-1 text-sm text-neutral-500">
              Overall academy financial performance.
            </p>
          </div>

          <div className="rounded-xl bg-green-100 p-3">
            <DollarSign className="h-6 w-6 text-green-700" />
          </div>
        </div>

        {/* Revenue */}

        <div>
          <p className="text-sm text-neutral-500">Total Revenue Collected</p>

          <h3 className="mt-2 text-4xl font-bold">
            {formatCurrency(totalRevenue)}
          </h3>

          <div className="mt-3 flex items-center gap-2 text-sm">
            {monthlyGrowth >= 0 ? (
              <>
                <ArrowUpRight className="h-4 w-4 text-green-600" />

                <span className="font-medium text-green-600">
                  +{monthlyGrowth.toFixed(1)}%
                </span>
              </>
            ) : (
              <>
                <ArrowDownRight className="h-4 w-4 text-red-600" />

                <span className="font-medium text-red-600">
                  {monthlyGrowth.toFixed(1)}%
                </span>
              </>
            )}

            <span className="text-neutral-500">vs previous month</span>
          </div>
        </div>

        {/* Collection Rate */}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Collection Rate</span>

            <span className="font-semibold">{collectionRate}%</span>
          </div>

          <Progress value={collectionRate} />
        </div>

        {/* Summary */}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-neutral-50 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Outstanding
            </p>

            <h4 className="mt-2 text-xl font-bold text-orange-600">
              {formatCurrency(outstanding)}
            </h4>
          </div>

          <div className="rounded-xl bg-neutral-50 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Refunded
            </p>

            <h4 className="mt-2 text-xl font-bold text-red-600">
              {formatCurrency(refunded)}
            </h4>
          </div>

          <div className="rounded-xl bg-neutral-50 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Written Off
            </p>

            <h4 className="mt-2 text-xl font-bold text-purple-600">
              {formatCurrency(writtenOff)}
            </h4>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
