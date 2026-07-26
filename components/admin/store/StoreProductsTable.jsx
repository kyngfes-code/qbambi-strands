"use client";

import SearchBar from "@/components/admin/store/SearchBar";
import { useMemo, useState } from "react";
import StoreProductRow from "./StoreProductRow";
import ProductImagesModal from "./ProductImagesModal";

export default function StoreProductsTable({ products = [] }) {
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;

    const term = search.toLowerCase();

    return products.filter((product) => {
      return [
        product.title,
        product.category,
        product.wigType,
        product.material,
        product.style,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));
    });
  }, [products, search]);

  return (
    <>
      <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        {/* Header */}

        <div className="flex flex-col gap-5 border-b p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">
              Store Products
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              {filteredProducts.length} of {products.length} product
              {products.length !== 1 && "s"}
            </p>
          </div>

          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by title, category, style..."
          />
        </div>

        {/* Desktop */}

        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-full">
            <thead className="bg-neutral-50">
              <tr className="border-b text-left text-sm font-semibold text-neutral-700">
                <th className="px-6 py-4">Images</th>

                <th className="px-6 py-4">Product</th>

                <th className="px-6 py-4">Category</th>

                <th className="px-6 py-4 text-center">Qty</th>

                <th className="px-6 py-4">Price</th>

                <th className="px-6 py-4">Status</th>

                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-20 text-center text-neutral-500"
                  >
                    No matching products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <StoreProductRow
                    key={product.id}
                    product={product}
                    onOpenImages={setSelectedProduct}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile */}

        <div className="space-y-4 p-4 lg:hidden">
          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-12 text-center text-neutral-500">
              No matching products found.
            </div>
          ) : (
            filteredProducts.map((product) => (
              <StoreProductRow
                key={product.id}
                product={product}
                mobile
                onOpenImages={setSelectedProduct}
              />
            ))
          )}
        </div>
      </section>

      <ProductImagesModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
