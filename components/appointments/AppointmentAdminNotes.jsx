"use client";

export default function AppointmentAdminNotes({
  appointment,
  isAdmin = false,
}) {
  if (!isAdmin || !appointment.admin_notes) {
    return null;
  }

  return (
    <div className="border rounded-2xl p-2">
      <h3 className="font-bold text-lg mb-3">Admin Notes</h3>

      <p className="whitespace-pre-wrap">{appointment.admin_notes}</p>
    </div>
  );
}
