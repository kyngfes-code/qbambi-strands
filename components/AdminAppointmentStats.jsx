"use client";

export default function AdminAppointmentStats({
  appointments = [],
  pendingPayments = [],
}) {
  const totalAppointments = appointments.length;

  const pendingRequests = appointments.filter(
    (a) => a.status === "pending",
  ).length;

  const confirmedAppointments = appointments.filter(
    (a) => a.status === "confirmed",
  ).length;

  const completedAppointments = appointments.filter(
    (a) => a.status === "completed",
  ).length;

  const cancelledAppointments = appointments.filter(
    (a) => a.status === "cancelled",
  ).length;

  const totalRevenue = appointments.reduce(
    (sum, appointment) => sum + Number(appointment.amount_paid || 0),
    0,
  );

  const totalTips = appointments.reduce((sum, appointment) => {
    const tips =
      appointment.appointment_payment_adjustments
        ?.filter((adjustment) => adjustment.adjustment_type === "tip")
        .reduce(
          (tipSum, adjustment) => tipSum + Number(adjustment.amount || 0),
          0,
        ) || 0;

    return sum + tips;
  }, 0);

  const stats = [
    {
      label: "Total Appointments",
      value: totalAppointments,
      color: "bg-neutral-100",
      text: "text-neutral-800",
    },
    {
      label: "Pending Requests",
      value: pendingRequests,
      color: "bg-yellow-100",
      text: "text-yellow-700",
    },
    {
      label: "Pending Payments",
      value: pendingPayments.length,
      color: "bg-orange-100",
      text: "text-orange-700",
    },
    {
      label: "Confirmed",
      value: confirmedAppointments,
      color: "bg-blue-100",
      text: "text-blue-700",
    },
    {
      label: "Completed",
      value: completedAppointments,
      color: "bg-green-100",
      text: "text-green-700",
    },
    {
      label: "Cancelled",
      value: cancelledAppointments,
      color: "bg-red-100",
      text: "text-red-700",
    },
    {
      label: "Revenue Collected",
      value: `₦${totalRevenue.toLocaleString()}`,
      color: "bg-emerald-100",
      text: "text-emerald-700",
    },
    {
      label: "Tips Collected",
      value: `₦${totalTips.toLocaleString()}`,
      color: "bg-purple-100",
      text: "text-purple-700",
    },
  ];

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">Appointment Overview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.color} border rounded-2xl p-5 shadow-sm`}
          >
            <p className="text-sm font-medium text-neutral-500">{stat.label}</p>

            <p className={`mt-2 text-3xl font-bold ${stat.text}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
