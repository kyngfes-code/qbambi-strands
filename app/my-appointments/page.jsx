"use client";

import { useEffect, useMemo, useState } from "react";
import NavBarCart from "@/components/NavBarCart";
import OfflineNotice from "@/components/OfflineNotice";
import { useOnlineStatus } from "../OnlineStatusProvider";
import AppointmentDetailsModal from "@/components/appointments/AppointmentDetailsModal";
import AppointmentCard from "@/components/appointments/AppointmentCard";
import PageSpinner from "@/components/PageSpinner";

export default function MyAppointmentsPage() {
  const isOnline = useOnlineStatus();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  async function loadAppointments() {
    try {
      setError("");

      const res = await fetch("/api/appointments");

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);

        throw new Error(
          errorData?.error || `Failed to load appointments (${res.status})`,
        );
      }

      const data = await res.json();

      setAppointments(data || []);
    } catch (err) {
      console.error("Appointments load error:", err);
      setAppointments([]);
      setError("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isOnline) {
      setLoading(false);
      return;
    }

    setLoading(true);
    loadAppointments();
  }, [isOnline]);

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [appointments]);

  if (!isOnline) {
    return <OfflineNotice />;
  }

  if (loading) {
    return <PageSpinner text="Loading appointment dashboard..." />;
  }

  if (error) {
    return <p className="text-center mt-20 text-red-500">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <NavBarCart />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">My Appointments</h1>

        {!appointments.length ? (
          <div className="bg-white rounded-2xl p-10 text-center border">
            <p className="text-neutral-500">
              You haven't booked any appointments yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onViewDetails={setSelectedAppointment}
                onRefresh={loadAppointments}
              />
            ))}
          </div>
        )}
      </main>

      {selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          isAdmin={false}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </div>
  );
}
