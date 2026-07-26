export default function ProductSpecifications({ product }) {
  const specs = [
    { label: "Category", value: product.category },
    { label: "Wig Type", value: product.wigType },
    { label: "Material", value: product.material },
    { label: "Style", value: product.style },
    { label: "Quantity Available", value: product.quantity },
  ].filter((item) => item.value);

  return (
    <section className="rounded-3xl border border-[#f1d9e3] bg-white p-8 shadow-sm">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#B33863]/70">
          Specifications
        </p>

        <h2 className="mt-2 text-3xl font-semibold text-neutral-900">
          Product Details
        </h2>
      </div>

      <div className="divide-y divide-[#f3e3ea]">
        {specs.map((item) => (
          <div
            key={item.label}
            className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-sm font-medium uppercase tracking-wider text-neutral-500">
              {item.label}
            </span>

            <span className="text-base font-semibold text-neutral-900">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
