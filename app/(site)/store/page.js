import StoreFilter from "@/components/StoreFilter";
import StoreItemList from "@/components/StoreItemList";

export const metadata = {
  title: "Store",
};

export default async function Page({ searchParams }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fffdfc] via-[#fff8fa] to-white">
      {/* Filter Bar */}
      <div className="sticky top-0 z-30 border-b border-[#f3d9e4]/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-[1700px]">
          <StoreFilter />
        </div>
      </div>

      {/* Store Content */}
      <main className="mx-auto w-full max-w-[1700px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12 xl:px-10 2xl:px-14">
        <div className="space-y-10">
          {/* Optional heading */}
          <div className="text-center">
            <p className="mb-2 text-xs uppercase tracking-[0.35em] text-[#B33863]">
              Premium Collection
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
              Discover Your Perfect Look
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
              Browse our curated collection of luxury wigs, premium hair,
              accessories and beauty essentials crafted to elevate your style.
            </p>
          </div>

          {/* Product Grid */}
          <StoreItemList searchParams={searchParams} />
        </div>
      </main>
    </div>
  );
}
