import { Sparkles, CheckCircle2 } from "lucide-react";

const DEFAULT_CARE_GUIDE = [
  "Wash with a sulfate-free shampoo and moisturizing conditioner.",
  "Air dry whenever possible to preserve softness and longevity.",
  "Always use a heat protectant before styling with heated tools.",
  "Store on a mannequin head or in a satin bag when not in use.",
  "Brush gently from the ends upward using a wide-tooth comb.",
];

export default function ProductCare({ careGuide = [] }) {
  const tips = Array.isArray(careGuide) ? careGuide : DEFAULT_CARE_GUIDE;

  return (
    <section className="overflow-hidden rounded-3xl border border-[#f2dce5] bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-[#f6e7ed] bg-gradient-to-r from-[#fff8fa] to-white px-8 py-7">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1f6]">
            <Sparkles className="h-7 w-7 text-[#B33863]" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B33863]/70">
              Hair Care
            </p>

            <h2 className="mt-1 text-3xl font-semibold text-neutral-900">
              Care Guide
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Simple care habits to maintain softness, shine and longevity.
            </p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="grid gap-5 p-8 md:grid-cols-2">
        {tips.map((tip, index) => (
          <div
            key={index}
            className="flex items-start gap-4 rounded-2xl border border-[#f6e5ec] bg-[#fffafb] p-5 transition-all duration-300 hover:border-[#B33863]/30 hover:shadow-md"
          >
            <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#B33863]/10">
              <CheckCircle2 className="h-5 w-5 text-[#B33863]" />
            </div>

            <p className="text-sm leading-7 text-neutral-700">{tip}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-[#f6e7ed] bg-[#fff8fa] px-8 py-5">
        <p className="text-sm leading-7 text-neutral-600">
          <span className="font-semibold text-[#B33863]">
            Qbambi Recommendation:
          </span>{" "}
          Consistent maintenance helps preserve your hair's natural beauty,
          extending its lifespan and ensuring it continues to look luxurious
          with every wear.
        </p>
      </div>
    </section>
  );
}
