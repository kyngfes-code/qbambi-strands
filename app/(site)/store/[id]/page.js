import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { getStoreItem } from "@/lib/data-service";

import BackButton from "@/components/store/BackButton";
import ProductGallery from "@/components/store/ProductGallery";
import ProductSpecifications from "@/components/store/ProductSpecifications";
import ProductDescription from "@/components/store/ProductDescription";
import ProductCare from "@/components/store/ProductCare";
import ProductShipping from "@/components/store/ProductShipping";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getStoreItem(id);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.title,
    description: product.description,
    openGraph: {
      images: [product.image],
    },
  };
}

export default async function Page({ params }) {
  const { id } = await params;
  const product = await getStoreItem(id);

  if (!product) notFound();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* ---------------- Breadcrumb ---------------- */}

      <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <BackButton />

        <div className="hidden items-center gap-2 text-sm text-neutral-500 md:flex">
          <Link href="/">Home</Link>

          <ChevronRight className="h-4 w-4" />

          <Link href="/store">Store</Link>

          <ChevronRight className="h-4 w-4" />

          <span className="font-medium text-neutral-900">{product.title}</span>
        </div>
      </div>

      {/* ---------------- Hero ---------------- */}

      <section className="grid gap-10 lg:grid-cols-[1.08fr_.92fr] lg:gap-16 xl:gap-20">
        <ProductGallery
          title={product.title}
          main_image={product.image}
          extra_images={product.extra_images}
        />

        <ProductSpecifications product={product} />
      </section>

      {/* ---------------- Description ---------------- */}

      <section className="mt-20 lg:mt-28">
        <ProductDescription product={product} />
      </section>

      {/* ---------------- Care ---------------- */}

      <section className="mt-16 lg:mt-20">
        <ProductCare careGuide={product.care_guide} />
      </section>

      {/* ---------------- Shipping ---------------- */}

      <section className="mt-16 lg:mt-20">
        <ProductShipping />
      </section>

      {/* ---------------- Related Products ---------------- */}

      <section className="mt-20 border-t border-[#f2e5ea] pt-16 lg:mt-28 lg:pt-20">
        {/* Related Products */}
      </section>
    </main>
  );
}
