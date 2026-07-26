import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-6">
      <h1 className="text-4xl font-bold">Product not found</h1>

      <p className="text-neutral-600">
        The product you're looking for doesn't exist.
      </p>

      <Link
        href="/shop"
        className="rounded-xl bg-[#B33863] px-6 py-3 text-white"
      >
        Back to Store
      </Link>
    </div>
  );
}
