import StoreProductsTable from "@/components/admin/store/StoreProductsTable";
import FormShopItems from "@/components/FormShopItems";
import MobileStoreForm from "@/components/admin/store/MobileStoreForm";
import { getStoreItems, getStoreItemExtraImages } from "@/lib/data-service";

export default async function Page() {
  const products = await getStoreItems();
  const extraImages = await getStoreItemExtraImages();

  return (
    <main className="mx-auto max-w-[1700px] px-4 py-6 lg:px-6 lg:py-8">
      {/* Mobile Floating Form */}
      <div className="lg:hidden">
        <MobileStoreForm>
          <FormShopItems />
        </MobileStoreForm>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_430px]">
        <StoreProductsTable products={products} extraImages={extraImages} />

        {/* Desktop Form */}
        <aside className="sticky top-6 hidden self-start lg:block">
          <FormShopItems />
        </aside>
      </div>
    </main>
  );
}
