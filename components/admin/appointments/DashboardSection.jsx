"use client";

export default function DashboardSection({ title, description, children }) {
  return (
    <section
      className="
        bg-white rounded-2xl
        shadow-sm border overflow-hidden
      "
    >
      <div className="p-5 border-b">
        <h2 className="text-xl font-bold">{title}</h2>

        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>

      {children}
    </section>
  );
}
