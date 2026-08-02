import Link from "next/link";
import { ArrowLeft, Images } from "lucide-react";

import SaloonImageCard from "@/components/SaloonImageCard";
import { getSaloonData } from "@/lib/data-service";
import BackButton from "@/app/(site)/saloon/BackButton";

export default async function Page() {
  const data = await getSaloonData();
  const images = data.slice(0, 4);

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Salon Hero Images
            </h1>

            <p className="mt-2 text-neutral-500">
              Choose a hero image below to update or replace.
            </p>
          </div>

          <Link
            href="/admin/saloon/images"
            className="inline-flex items-center gap-2 self-start rounded-xl border border-neutral-300 bg-white px-5 py-3 font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-100"
          >
            <Images className="h-5 w-5" />
            Manage Gallery
          </Link>
        </div>

        {/* Images */}
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {images.map((item) => (
              <SaloonImageCard
                key={item.id}
                href={`/admin/saloon/${item.id}`}
                src={item.images}
                className="transition-transform duration-300 hover:-translate-y-1"
              />
            ))}
          </div>
        </section>

        {/* Bottom Navigation */}
        <div className="mt-8 flex justify-start">
          <Link
            href="/admin/saloon/images"
            className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 font-medium text-white transition hover:bg-neutral-800"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Salon Gallery
          </Link>
        </div>
      </div>
    </main>
  );
}
