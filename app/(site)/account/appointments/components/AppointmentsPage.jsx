"use client";

import { useEffect, useMemo, useState } from "react";
import AppointmentCard from "./AppointmentCard";
import AppointmentTable from "./AppointmentTable";
import AppointmentFilters from "./AppointmentFilters";
import EmptyAppointments from "./EmptyAppointments";
import Link from "next/link";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    try {
      const res = await fetch("/api/account/appointments");

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setAppointments(data.appointments ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    if (status === "all") return appointments;

    return appointments.filter((a) => a.status === status);
  }, [appointments, status]);

  if (loading) {
    return <p>Loading appointments...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Appointments</h1>

          <p className="mt-2 text-neutral-500">
            Manage your appointments and payments.
          </p>
        </div>

        <Link
          href="/appointments"
          className="
      inline-flex
      items-center
      justify-center
      rounded-xl
      bg-black
      px-5
      py-3
      text-sm
      font-medium
      text-white
      transition
      hover:bg-neutral-800
    "
        >
          + Book New Appointment
        </Link>
      </div>

      <AppointmentFilters status={status} setStatus={setStatus} />

      {!filtered.length && <EmptyAppointments />}

      {!!filtered.length && (
        <>
          <div className="hidden lg:block">
            <AppointmentTable appointments={filtered} />
          </div>

          <div className="space-y-5 lg:hidden">
            {filtered.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
