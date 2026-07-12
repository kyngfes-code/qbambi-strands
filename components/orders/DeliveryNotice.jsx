"use client";

export default function DeliveryNotice() {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xl">
          ⚠️
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-amber-900">Delivery Fee</h3>

          <p className="text-sm leading-6 text-amber-800">
            Waybill cost is calculated separately after checkout based on your
            delivery location, package size, and courier rates.
          </p>

          <p className="text-sm leading-6 text-amber-800">
            You will be contacted with the delivery fee for approval before your
            order is dispatched.
          </p>
        </div>
      </div>
    </section>
  );
}
