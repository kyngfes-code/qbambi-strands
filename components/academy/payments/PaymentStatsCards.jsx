"use client";

import {
  CreditCard,
  DollarSign,
  Receipt,
  Wallet,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

//////////////////////////////////////////////////////////////

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

//////////////////////////////////////////////////////////////

function StatCard({ title, value, subtitle, icon: Icon, iconClassName }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="flex items-center justify-between p-6">
        <div className="min-w-0">
          <p className="text-sm font-medium text-neutral-500">{title}</p>

          <h3 className="mt-2 truncate text-2xl font-bold">{value}</h3>

          {subtitle ? (
            <p className="mt-2 text-xs text-neutral-500">{subtitle}</p>
          ) : null}
        </div>

        <div className={`rounded-xl p-3 ${iconClassName}`}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}

//////////////////////////////////////////////////////////////

export default function PaymentStatsCards({ stats = {} }) {
  const {
    totalCollected = 0,

    totalRefunded = 0,

    outstandingBalance = 0,

    paymentCount = 0,

    netCollected = 0,

    totalWrittenOff = 0,
  } = stats;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard
        title="Total Collected"
        value={formatCurrency(totalCollected)}
        subtitle="Successful academy payments"
        icon={DollarSign}
        iconClassName="bg-green-100 text-green-700"
      />

      <StatCard
        title="Net Collected"
        value={formatCurrency(netCollected)}
        subtitle="After refunds"
        icon={TrendingUp}
        iconClassName="bg-emerald-100 text-emerald-700"
      />

      <StatCard
        title="Refunded"
        value={formatCurrency(totalRefunded)}
        subtitle="Refunds issued"
        icon={TrendingDown}
        iconClassName="bg-red-100 text-red-600"
      />

      <StatCard
        title="Outstanding"
        value={formatCurrency(outstandingBalance)}
        subtitle="Balance still owed"
        icon={Wallet}
        iconClassName="bg-orange-100 text-orange-700"
      />

      <StatCard
        title="Written Off"
        value={formatCurrency(totalWrittenOff)}
        subtitle="Outstanding waived"
        icon={Receipt}
        iconClassName="bg-purple-100 text-purple-700"
      />

      <StatCard
        title="Payments"
        value={paymentCount.toLocaleString()}
        subtitle="Recorded payments"
        icon={CreditCard}
        iconClassName="bg-blue-100 text-blue-700"
      />
    </div>
  );
}
