import { Truck, Clock3, ShieldCheck, MapPin, PackageCheck } from "lucide-react";

export default function ProductShipping() {
  return (
    <section className="rounded-3xl border border-[#f1d9e3] bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-2xl bg-[#fff4f7] p-3">
          <Truck className="h-6 w-6 text-[#B33863]" />
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">
            Shipping & Delivery
          </h2>

          <p className="text-sm text-neutral-500">
            Fast, secure and carefully packaged.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex gap-4">
          <Clock3 className="mt-1 h-5 w-5 text-[#B33863]" />

          <div>
            <h3 className="font-semibold text-neutral-900">Processing Time</h3>

            <p className="mt-1 text-sm leading-6 text-neutral-600">
              Orders are processed within 1–3 business days before shipping.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Truck className="mt-1 h-5 w-5 text-[#B33863]" />

          <div>
            <h3 className="font-semibold text-neutral-900">
              Nationwide Delivery
            </h3>

            <p className="mt-1 text-sm leading-6 text-neutral-600">
              We deliver across Nigeria through trusted logistics partners.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <PackageCheck className="mt-1 h-5 w-5 text-[#B33863]" />

          <div>
            <h3 className="font-semibold text-neutral-900">Secure Packaging</h3>

            <p className="mt-1 text-sm leading-6 text-neutral-600">
              Every order is professionally packaged to preserve the quality of
              your hair product during transit.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <ShieldCheck className="mt-1 h-5 w-5 text-[#B33863]" />

          <div>
            <h3 className="font-semibold text-neutral-900">Order Protection</h3>

            <p className="mt-1 text-sm leading-6 text-neutral-600">
              Tracking information is provided once your order has been
              dispatched.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-[#fff6f9] p-5">
        <div className="flex gap-3">
          <MapPin className="mt-1 h-5 w-5 text-[#B33863]" />

          <div>
            <h4 className="font-semibold text-neutral-900">
              International Orders
            </h4>

            <p className="mt-2 text-sm leading-6 text-neutral-600">
              International shipping availability varies by destination.
              Delivery times and customs fees may differ depending on your
              country.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
