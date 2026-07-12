"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

    if (!service || !appointmentDate || !appointmentTime) {
      return alert("Please complete all required fields.");
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
        router.push("/api/auth/signin");
        return;
      }

      if (!res.ok) {
        throw new Error(data.error);
      }

      alert("Appointment request submitted successfully.");

      router.push("/account/appointments");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Hero */}

      <section className="bg-gradient-to-r from-stone-900 via-stone-800 to-black text-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <span className="rounded-full bg-white/10 px-4 py-2 text-sm">
            Luxury Beauty Experience
          </span>

          <h1 className="mt-8 font-playfair text-5xl font-bold">
            Book Your Appointment
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-neutral-300">
            Schedule your appointment with Qbambi Strands. Our team will review
            your request, confirm availability, and send payment instructions.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-3">
        {/* Form */}

        <div className="lg:col-span-2 rounded-3xl bg-white p-8 shadow-xl">
          <h2 className="text-3xl font-bold">Appointment Details</h2>

          <form onSubmit={handleSubmit} className="mt-10 space-y-8">
            <div>
              <label className="mb-2 block font-medium">Select Service</label>

              <select
                required
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full rounded-xl border p-4"
              >
                <option value="">Choose a Service</option>

                {SERVICES.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium">Preferred Date</label>

                <input
                  required
                  type="date"
                  value={appointmentDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full rounded-xl border p-4"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">Preferred Time</label>

                <input
                  required
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full rounded-xl border p-4"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Additional Information
              </label>

              <textarea
                rows={6}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Hair inspiration, special requests, allergies, preferred stylist..."
                className="w-full rounded-xl border p-4"
              />
            </div>

            <button
              disabled={loading}
              className="w-full rounded-xl bg-black py-4 text-lg font-semibold text-white transition hover:bg-neutral-800 disabled:bg-neutral-400"
            >
              {loading ? "Submitting..." : "Book Appointment"}
            </button>
          </form>
        </div>

        {/* Sidebar */}

        <aside className="space-y-6">
          <div className="rounded-3xl bg-white p-8 shadow-lg">
            <h3 className="text-xl font-semibold">What Happens Next?</h3>

            <ol className="mt-6 space-y-6 text-sm text-neutral-600">
              <li>
                <strong>1.</strong> Submit your appointment request.
              </li>

              <li>
                <strong>2.</strong> Our team reviews availability.
              </li>

              <li>
                <strong>3.</strong> Deposit/payment instructions are sent.
              </li>

              <li>
                <strong>4.</strong> Your appointment is officially confirmed.
              </li>
            </ol>
          </div>

          <div className="rounded-3xl bg-amber-50 p-8">
            <h3 className="text-xl font-semibold">Need Assistance?</h3>

            <p className="mt-4 text-sm text-neutral-700">
              If you're unsure which service to book or need urgent assistance,
              our team is happy to help before you submit your request call us
              or whatsapp on 08136976058.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
