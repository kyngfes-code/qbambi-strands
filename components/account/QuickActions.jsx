import Link from "next/link";

export default function QuickActions() {
  const actions = [
    {
      href: "/appointments",
      label: "Book Appointment",
    },
    {
      href: "/store",
      label: "Continue Shopping",
    },
    {
      href: "/account/cart",
      label: "View Cart",
    },
    {
      href: "/account/orders",
      label: "My Orders",
    },
    {
      href: "/account/payments",
      label: "Payment History",
    },
  ];

  return (
    <div className="rounded-xl border bg-white p-6">
      <h2 className="mb-5 text-lg font-semibold">Quick Actions</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-lg border p-4 text-center transition hover:bg-neutral-100"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
