"use client";

export default function DashboardSection({
  title,
  children,
  actions,
  description,
  className = "",
  titleClassName = "",
}) {
  return (
    <section className={`bg-white rounded-2xl border shadow-sm ${className}`}>
      <div className="flex flex-col gap-3 border-b p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className={`text-xl font-bold ${titleClassName}`}>{title}</h2>

          {description && (
            <p className="mt-1 text-sm text-neutral-500">{description}</p>
          )}
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
}
