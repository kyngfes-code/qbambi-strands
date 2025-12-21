"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function StoreFilter() {
  const [openProducts, setOpenProducts] = useState(false);
  const [openPrice, setOpenPrice] = useState(false);

  const [openWigs, setOpenWigs] = useState(false);
  const [openCapType, setOpenCapType] = useState(false);
  const [openMaterial, setOpenMaterial] = useState(false);
  const [openInstallation, setOpenInstallation] = useState(false);
  const [openStyle, setOpenStyle] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTitle = searchParams.get("title") ?? "all";
  const activeCategory = searchParams.get("category") ?? "all";
  const activeMaterial = searchParams.get("material") ?? "all";
  const activeWigType = searchParams.get("wigType") ?? "none";
  const activeStyle = searchParams.get("style") ?? "none";
  const activePrice = searchParams.get("price") ?? "all";
  const activeSort = searchParams.get("sort") ?? "none";

  function updateParam(key, value, clearAll = false) {
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete(key);

      if (clearAll) {
        router.replace(pathname, { scroll: false });
        return;
      }
    } else {
      params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleFilterClick(key, value, clearAll) {
    updateParam(key, value, clearAll);

    // close dropdowns automatically
    setOpenProducts(false);
    setOpenWigs(false);
    setOpenCapType(false);
    setOpenMaterial(false);
    setOpenInstallation(false);
    setOpenStyle(false);
    setOpenPrice(false);
  }

  return (
    <div className=" sticky top-15 grid grid-cols-[auto_auto_auto] items-center justify-center text-xs gap-2 p-0 z-50 ml-8 mt-2">
      {/* PRODUCT FILTER */}
      <div className="border p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 relative">
        <button
          onClick={() => setOpenProducts(!openProducts)}
          className="flex justify-between items-center text-left font-medium"
        >
          Filter by Products
          <span>{openProducts ? "▲" : "▼"}</span>
        </button>

        {/* PRODUCT DROPDOWN */}
        {openProducts && (
          <div className="absolute left-0 top-full mt-2 bg-white shadow-lg rounded-lg p-3 z-50 w-max">
            <div className="flex flex-col gap-2">
              <FilterButton
                label="All"
                value="all"
                active={activeTitle}
                onClick={() => handleFilterClick("title", "all", true)}
              />

              {/* WIGS MAIN BUTTON */}
              <button
                className="px-4 py-2 rounded-lg border bg-gray-100 text-gray-700 hover:bg-gray-200 flex justify-between items-center"
                onClick={() => setOpenWigs(!openWigs)}
              >
                Wigs
                <span>{openWigs ? "▲" : "▼"}</span>
              </button>

              {/* WIG CATEGORIES */}
              {openWigs && (
                <div className="ml-4 mt-2 flex flex-col gap-3">
                  <FilterButton
                    label="ALL Wigs"
                    value="wigs"
                    active={activeCategory}
                    onClick={() => handleFilterClick("category", "wigs")}
                  />
                  <button
                    className="flex justify-between items-center font-semibold text-gray-700"
                    onClick={() => setOpenCapType(!openCapType)}
                  >
                    By Lace Type
                    <span>{openCapType ? "▲" : "▼"}</span>
                  </button>

                  {openCapType && (
                    <div className="ml-4 flex flex-col gap-1">
                      <FilterButton
                        label="Full Lace Wig"
                        value="full-lace"
                        active={activeWigType}
                        onClick={() =>
                          handleFilterClick("wigType", "full-lace")
                        }
                      />
                      <FilterButton
                        label="360 Lace Wig"
                        value="360-lace"
                        active={activeWigType}
                        onClick={() => handleFilterClick("wigType", "360-lace")}
                      />
                      <FilterButton
                        label="Closure Wig"
                        value="closure"
                        active={activeWigType}
                        onClick={() => handleFilterClick("wigType", "closure")}
                      />
                      <FilterButton
                        label="Frontal Wig"
                        value="frontal"
                        active={activeWigType}
                        onClick={() => handleFilterClick("wigType", "frontal")}
                      />
                    </div>
                  )}

                  {/* ------------------ MATERIAL ------------------ */}
                  <button
                    className="flex justify-between items-center font-semibold text-gray-700"
                    onClick={() => setOpenMaterial(!openMaterial)}
                  >
                    By Material
                    <span>{openMaterial ? "▲" : "▼"}</span>
                  </button>

                  {openMaterial && (
                    <div className="ml-4 flex flex-col gap-1">
                      <FilterButton
                        label="Human Hair"
                        value="human-hair"
                        active={activeMaterial}
                        onClick={() =>
                          handleFilterClick("material", "human-hair")
                        }
                      />
                      <FilterButton
                        label="Synthetic"
                        value="synthetic"
                        active={activeMaterial}
                        onClick={() =>
                          handleFilterClick("material", "synthetic")
                        }
                      />
                      <FilterButton
                        label="Blend (Human + Synthetic)"
                        value="blend"
                        active={activeMaterial}
                        onClick={() => handleFilterClick("material", "blend")}
                      />
                    </div>
                  )}

                  {/* ------------------ STYLE ------------------ */}
                  <button
                    className="flex justify-between items-center font-semibold text-gray-700"
                    onClick={() => setOpenStyle(!openStyle)}
                  >
                    By Style
                    <span>{openStyle ? "▲" : "▼"}</span>
                  </button>

                  {openStyle && (
                    <div className="ml-4 flex flex-col gap-1">
                      <FilterButton
                        label="Braided wigs"
                        value="braided wigs"
                        active={activeStyle}
                        onClick={() =>
                          handleFilterClick("style", "braided wigs")
                        }
                      />
                      <FilterButton
                        label="Straight"
                        value="straight"
                        active={activeStyle}
                        onClick={() => handleFilterClick("style", "straight")}
                      />
                      <FilterButton
                        label="Body Wave"
                        value="body-wave"
                        active={activeStyle}
                        onClick={() => handleFilterClick("style", "body-wave")}
                      />
                      <FilterButton
                        label="Deep Wave"
                        value="deep-wave"
                        active={activeStyle}
                        onClick={() => handleFilterClick("style", "deep-wave")}
                      />
                      <FilterButton
                        label="Jerry Curl"
                        value="jerry-curl"
                        active={activeStyle}
                        onClick={() => handleFilterClick("style", "jerry-curl")}
                      />
                      <FilterButton
                        label="Kinky Curly"
                        value="kinky-curly"
                        active={activeStyle}
                        onClick={() =>
                          handleFilterClick("style", "kinky-curly")
                        }
                      />
                      <FilterButton
                        label="Kinky Straight"
                        value="kinky-straight"
                        active={activeStyle}
                        onClick={() =>
                          handleFilterClick("style", "kinky-straight")
                        }
                      />
                      <FilterButton
                        label="Water Wave"
                        value="water-wave"
                        active={activeStyle}
                        onClick={() => handleFilterClick("style", "water-wave")}
                      />
                      <FilterButton
                        label="Pixie Cut"
                        value="pixie"
                        active={activeStyle}
                        onClick={() => handleFilterClick("style", "pixie")}
                      />
                      <FilterButton
                        label="Bob"
                        value="bob"
                        active={activeStyle}
                        onClick={() => handleFilterClick("style", "bob")}
                      />
                    </div>
                  )}
                </div>
              )}
              <FilterButton
                label="Make-up Accessories"
                value="makeUp"
                active={activeTitle}
                onClick={() => handleFilterClick("title", "makeUp")}
              />
              <FilterButton
                label="Jewelries"
                value="Jewelries"
                active={activeTitle}
                onClick={() => handleFilterClick("title", "Jewelries")}
              />
            </div>
          </div>
        )}
      </div>

      {/* PRICE + SORTING stay the same… */}

      {/* PRICE FILTER */}
      <div className="border p-2 rounded-lg relative bg-gray-100 text-gray-700 hover:bg-gray-200">
        <button
          onClick={() => setOpenPrice(!openPrice)}
          className=" flex justify-between items-center text-left font-medium"
        >
          Filter by Price
          <span>{openPrice ? "▲" : "▼"}</span>
        </button>

        {openPrice && (
          <div className="absolute left-0 top-full mt-2 bg-white shadow-lg rounded-lg p-3 z-50 w-max">
            <div className="flex flex-col gap-2">
              <FilterButton
                label="All Prices"
                value="all"
                active={activePrice}
                onClick={() => handleFilterClick("price", "all")}
              />
              <FilterButton
                label="₦0 – ₦30k"
                value="low"
                active={activePrice}
                onClick={() => handleFilterClick("price", "low")}
              />
              <FilterButton
                label="₦31k – ₦70k"
                value="mid-low"
                active={activePrice}
                onClick={() => handleFilterClick("price", "mid-low")}
              />
              <FilterButton
                label="₦71k – ₦150k"
                value="mid"
                active={activePrice}
                onClick={() => handleFilterClick("price", "mid")}
              />
              <FilterButton
                label="₦151k – ₦200k"
                value="high"
                active={activePrice}
                onClick={() => handleFilterClick("price", "high")}
              />
              <FilterButton
                label="₦201k + "
                value="luxury"
                active={activePrice}
                onClick={() => handleFilterClick("price", "luxury")}
              />
            </div>
          </div>
        )}
      </div>

      {/* SORTING */}
      <div className="flex gap-2">
        <FilterButton
          label="Sort: None"
          value="none"
          active={activeSort}
          onClick={() => updateParam("sort", "none")}
        />
        <FilterButton
          label="Price ↑"
          value="price-asc"
          active={activeSort}
          onClick={() => updateParam("sort", "price-asc")}
        />
        <FilterButton
          label="Price ↓"
          value="price-desc"
          active={activeSort}
          onClick={() => updateParam("sort", "price-desc")}
        />
        <FilterButton
          label="Title A–Z"
          value="title-asc"
          active={activeSort}
          onClick={() => updateParam("sort", "title-asc")}
        />
        <FilterButton
          label="Title Z–A"
          value="title-desc"
          active={activeSort}
          onClick={() => updateParam("sort", "title-desc")}
        />
      </div>
    </div>
  );
}

function FilterButton({ label, value, active, onClick }) {
  return (
    <button
      className={`px-4 py-2 rounded-lg border transition ${
        value === active
          ? "bg-black text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
