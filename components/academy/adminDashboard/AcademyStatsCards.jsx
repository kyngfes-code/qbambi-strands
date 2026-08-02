"use client";

import {
  Users,
  UserCheck,
  UserPlus,
  DollarSign,
  Wallet,
  GraduationCap,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

//////////////////////////////////////////////////////////////

function formatCurrency(amount = 0) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

//////////////////////////////////////////////////////////////

function StatCard({ title, value, subtitle, icon: Icon, iconBg, iconColor }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="flex items-center justify-between p-6">
        <div className="min-w-0">
          <p className="text-sm font-medium text-neutral-500">{title}</p>

          <h3 className="mt-2 truncate text-2xl font-bold text-neutral-900">
            {value}
          </h3>

          {subtitle && (
            <p className="mt-2 text-xs text-neutral-500">{subtitle}</p>
          )}
        </div>

        <div className={`rounded-xl p-3 ${iconBg} ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}

//////////////////////////////////////////////////////////////

export default function AcademyStatsCards({ stats = {} }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard
        title="Students"
        value={Number(stats.totalStudents || 0).toLocaleString()}
        subtitle="Total enrolled students"
        icon={Users}
        iconBg="bg-blue-100"
        iconColor="text-blue-700"
      />

      <StatCard
        title="Pending"
        value={Number(stats.pendingEnrollments || 0).toLocaleString()}
        subtitle="Awaiting approval"
        icon={UserPlus}
        iconBg="bg-amber-100"
        iconColor="text-amber-700"
      />

      <StatCard
        title="Active"
        value={Number(stats.activeStudents || 0).toLocaleString()}
        subtitle="Currently training"
        icon={UserCheck}
        iconBg="bg-green-100"
        iconColor="text-green-700"
      />

      <StatCard
        title="Revenue"
        value={formatCurrency(stats.totalRevenue)}
        subtitle="Collected payments"
        icon={DollarSign}
        iconBg="bg-emerald-100"
        iconColor="text-emerald-700"
      />

      <StatCard
        title="Outstanding"
        value={formatCurrency(stats.outstandingBalance)}
        subtitle="Fees yet to be paid"
        icon={Wallet}
        iconBg="bg-red-100"
        iconColor="text-red-700"
      />

      <StatCard
        title="Graduation"
        value={`${Number(stats.graduationRate || 0).toFixed(0)}%`}
        subtitle="Completion rate"
        icon={GraduationCap}
        iconBg="bg-purple-100"
        iconColor="text-purple-700"
      />
    </div>
  );
}
