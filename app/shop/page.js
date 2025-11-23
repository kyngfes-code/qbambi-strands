import HairList from "@/components/HairList";
import { ShopSideBar } from "@/components/ShopSideBar";

export default async function Page() {
  return (
    <div className="relative flex w-full">
      <ShopSideBar />
      <main className="w-full pl-30 lg:pl-64 px-4 py-4 xl:pl-50">
        <HairList />
      </main>
    </div>
  );
}
