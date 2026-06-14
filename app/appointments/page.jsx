"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NavBarCart from "@/components/NavBarCart";
import PaymentStatusCard from "@/components/payments/PaymentStatusCard";
import ReceiptUploader from "@/components/payments/ReceiptUploader";
import BankTransferPayment from "@/components/payments/BankTransferPayment";
import PaystackButton from "@/components/payments/PaystackButton";

const SERVICES = [
  "Hair Installation",
  "Wig Revamp",
  "Bridal Makeup",
  "Bridal Hair Styling",
  "Birthday Glam",
  "Casual Makeup",
  "Home Service",
  "Training Session",
  "Consultation",
];

export default function AppointmentsPage() {
  const router = useRouter();

  const [service, setService] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!service) {
      return alert("Please select a service.");
    }

    if (!appointmentDate) {
      return alert("Please select an appointment date.");
    }

    if (!appointmentTime) {
      return alert("Please select an appointment time.");
    }

    try {
      setLoading(true);

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_name: service,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          notes,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        alert("Please log in to book an appointment.");
        router.push("/login");
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to book appointment");
      }

      alert(
        "Appointment request submitted successfully. Our team will review it and provide payment instructions shortly.",
      );

      setService("");
      setAppointmentDate("");
      setAppointmentTime("");
      setNotes("");

      router.push("/my-appointments");
    } catch (error) {
      console.error(error);
      alert(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <NavBarCart />

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <h1 className="text-3xl font-bold">Book an Appointment</h1>

          <p className="mt-2 text-neutral-500">
            Schedule your beauty appointment with Q-Bambi. Once submitted, our
            team will review and confirm it.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Service */}
            <div>
              <label className="block font-medium mb-2">Service</label>

              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full border rounded-xl p-3"
                required
              >
                <option value="">Select a service</option>

                {SERVICES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block font-medium mb-2">Appointment Date</label>

              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full border rounded-xl p-3"
                required
              />
            </div>

            {/* Time */}
            <div>
              <label className="block font-medium mb-2">Appointment Time</label>

              <input
                type="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full border rounded-xl p-3"
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block font-medium mb-2">
                Additional Notes (Optional)
              </label>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                placeholder="Tell us anything we should know about your appointment..."
                className="w-full border rounded-xl p-3"
              />
            </div>

            {/* Notice */}
            <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
              <p className="text-sm text-pink-700">
                Please note that submitting an appointment request does not
                automatically reserve your slot. Our team will review your
                request and confirm your appointment.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-white transition ${
                loading
                  ? "bg-neutral-400 cursor-not-allowed"
                  : "bg-black hover:opacity-90"
              }`}
            >
              {loading ? "Booking Appointment..." : "Book Appointment"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
