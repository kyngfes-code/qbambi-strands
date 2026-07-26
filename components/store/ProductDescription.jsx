export default function ProductDescription({ product }) {
  return (
    <section className="rounded-3xl border border-[#f1d9e3] bg-white p-8 shadow-sm">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#B33863]/70">
          Description
        </p>

        <h2 className="mt-2 text-3xl font-semibold text-neutral-900">
          About this Product
        </h2>
      </div>

      <div className="space-y-6 text-[16px] leading-8 text-neutral-600">
        {/* Primary description */}
        {product.description && <p>{product.description}</p>}

        {/* Secondary description */}
        <p>
          {product.highlight ||
            "Crafted with premium materials and designed for a luxurious, natural appearance, this piece combines elegance with everyday comfort. Whether worn daily or for special occasions, it delivers exceptional beauty, versatility and confidence."}
        </p>

        {/* Third description */}
        <p>
          {product.quality_statement ||
            "Every Qbambi Strands product is carefully selected to meet our premium quality standards, ensuring long-lasting durability, superior comfort and an effortlessly beautiful finish you'll love wearing."}
        </p>
      </div>
    </section>
  );
}
