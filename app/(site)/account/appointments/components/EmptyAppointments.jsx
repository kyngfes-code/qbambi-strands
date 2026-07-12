import Link from "next/link";

export default function EmptyAppointments() {
  return (
    <div className="rounded-xl border bg-white p-10 text-center">
      <h2 className="text-2xl font-semibold">No appointments found</h2>

      <p className="mt-3 text-neutral-500">
        You haven't booked any appointments yet.
      </p>

      <Link
        href="/saloon"
        className="mt-6 inline-flex rounded-lg bg-black px-6 py-3 text-white"
      >
        Book Appointment
      </Link>
    </div>
  );
}
