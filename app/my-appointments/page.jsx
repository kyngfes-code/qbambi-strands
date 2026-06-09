"use client";

import { useEffect, useState } from "react";
import NavBarCart from "@/components/NavBarCart";
import OfflineNotice from "@/components/OfflineNotice";
import { useOnlineStatus } from "../OnlineStatusProvider";

export default function MyAppointmentsPage() {
  const isOnline = useOnlineStatus();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAppointments() {
    try {
      setError("");

      const res = await fetch("/api/appointments");

      if (!res.ok) {
        throw new Error("Failed to load appointments");
      }

      const data = await res.json();

      setAppointments(data || []);
    } catch (err) {
      console.error(err);
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

  if (!isOnline) {
    return <OfflineNotice />;
  }

  if (loading) {
    return <p className="text-center mt-20">Loading appointments...</p>;
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
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white border rounded-2xl p-6"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {appointment.service_name}
                    </h2>

                    <p className="text-sm text-neutral-500 mt-1">
                      Booking ID: {appointment.id.slice(0, 8)}
                    </p>

                    <p className="text-sm text-neutral-500">
                      Booked on{" "}
                      {new Date(appointment.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      appointment.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : appointment.status === "confirmed"
                          ? "bg-blue-100 text-blue-700"
                          : appointment.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : appointment.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-neutral-100 text-neutral-700"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>

                {/* Appointment Details */}
                <div className="mt-6 space-y-2">
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(
                      appointment.appointment_date,
                    ).toLocaleDateString()}
                  </p>

                  <p>
                    <strong>Time:</strong> {appointment.appointment_time}
                  </p>

                  {appointment.notes && (
                    <p>
                      <strong>Your Notes:</strong> {appointment.notes}
                    </p>
                  )}
                </div>

                {/* Awaiting Review */}
                {appointment.status === "pending" &&
                  !appointment.service_amount && (
                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <p className="font-medium text-yellow-700">
                        Awaiting Review
                      </p>

                      <p className="text-sm text-yellow-600 mt-1">
                        Our team is reviewing your request and will provide
                        pricing shortly.
                      </p>
                    </div>
                  )}

                {/* Payment Required */}
                {appointment.status === "pending" &&
                  appointment.service_amount > 0 && (
                    <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <p className="font-medium text-orange-700">
                        Payment Required
                      </p>

                      <div className="mt-3 space-y-1">
                        <p>
                          <strong>Service Cost:</strong> ₦
                          {Number(
                            appointment.service_amount || 0,
                          ).toLocaleString()}
                        </p>

                        <p>
                          <strong>Deposit Required:</strong> ₦
                          {Number(
                            appointment.deposit_required || 0,
                          ).toLocaleString()}
                        </p>

                        <p>
                          <strong>Amount Paid:</strong> ₦
                          {Number(
                            appointment.amount_paid || 0,
                          ).toLocaleString()}
                        </p>

                        <p>
                          <strong>Balance Due:</strong> ₦
                          {Number(
                            appointment.balance_due || 0,
                          ).toLocaleString()}
                        </p>
                      </div>

                      <p className="text-sm text-orange-600 mt-3">
                        Please complete the required payment to secure your
                        appointment slot.
                      </p>

                      {/* Payment buttons go here */}
                      {/* Paystack */}
                      {/* Receipt Upload */}
                    </div>
                  )}

                {/* Confirmed */}
                {appointment.status === "confirmed" && (
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="font-medium text-blue-700">
                      Appointment Confirmed
                    </p>

                    <p className="text-sm text-blue-600 mt-1">
                      We look forward to seeing you. Please arrive on time.
                    </p>

                    <div className="mt-3 space-y-1">
                      <p>
                        <strong>Total Cost:</strong> ₦
                        {Number(
                          appointment.service_amount || 0,
                        ).toLocaleString()}
                      </p>

                      <p>
                        <strong>Amount Paid:</strong> ₦
                        {Number(appointment.amount_paid || 0).toLocaleString()}
                      </p>

                      <p>
                        <strong>Outstanding Balance:</strong> ₦
                        {Number(appointment.balance_due || 0).toLocaleString()}
                      </p>
                    </div>

                    {appointment.confirmed_at && (
                      <p className="text-xs text-blue-500 mt-3">
                        Confirmed on{" "}
                        {new Date(appointment.confirmed_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Completed */}
                {appointment.status === "completed" && (
                  <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="font-medium text-green-700">
                      Appointment Completed
                    </p>

                    <p className="text-sm text-green-600 mt-1">
                      Thank you for choosing Q-Bambi. We hope you enjoyed your
                      experience.
                    </p>

                    {appointment.completed_at && (
                      <p className="text-xs text-green-500 mt-2">
                        Completed on{" "}
                        {new Date(appointment.completed_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Cancelled */}
                {appointment.status === "cancelled" && (
                  <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="font-medium text-red-700">
                      Appointment Cancelled
                    </p>

                    {appointment.cancellation_customer_message && (
                      <p className="mt-2">
                        {appointment.cancellation_customer_message}
                      </p>
                    )}

                    {appointment.cancellation_reason && (
                      <p className="text-sm text-gray-600 mt-2">
                        Reason: {appointment.cancellation_reason}
                      </p>
                    )}

                    {appointment.cancelled_at && (
                      <p className="text-xs text-gray-500 mt-2">
                        Cancelled on{" "}
                        {new Date(appointment.cancelled_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
