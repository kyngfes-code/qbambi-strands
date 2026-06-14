"use client";

export default function AdminAppointmentsHeader({ onRefresh }) {
  return (
    <div
      className="
        bg-white/80 backdrop-blur-sm
        rounded-2xl shadow-sm border
        p-5 sm:p-6
      "
    >
      <div
        className="
          flex flex-col gap-4
          md:flex-row md:items-center md:justify-between
        "
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Appointment Dashboard
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            Manage appointment requests, payments, confirmations, cancellations
            and completed services.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="
            px-5 py-3 rounded-xl
            bg-black text-white
            hover:opacity-90
            transition
          "
        >
          Refresh Dashboard
        </button>
      </div>
    </div>
  );
}
