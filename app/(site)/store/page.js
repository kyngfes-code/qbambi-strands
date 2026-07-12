import { ShopSideBar } from "@/components/ShopSideBar";
import StoreFilter from "@/components/StoreFilter";
import StoreItemList from "@/components/StoreItemList";

export const metadata = {
  title: "Store",
};

export default async function Page({ searchParams }) {
  return (
    <div className="flex flex-col">
      <StoreFilter />
      <div className="relative flex w-full">
        <ShopSideBar />
        <main className="w-full pl-30 lg:pl-50 px-4 py-4 xl:pl-40">
          <StoreItemList searchParams={searchParams} />
        </main>
      </div>
    </div>
  );
}
