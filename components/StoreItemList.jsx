import { getStoreItems } from "@/lib/data-service";
import Haircard from "./Haircard";

async function StoreItemList({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const items = await getStoreItems();

  if (!items.length) return null;
  const q = resolvedSearchParams.q?.toLowerCase() || "";

  let filtered = q
    ? items.filter((item) => {
        return (
          item.title?.toLowerCase().includes(q) ||
          item.wigType?.toLowerCase().includes(q) ||
          item.style?.toLowerCase().includes(q) ||
          item.material?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q)
        );
      })
    : [...items];

  const title = resolvedSearchParams.title ?? "all";
  const category = resolvedSearchParams.category ?? "all";
  const wigType = resolvedSearchParams.wigType ?? "none";
  const material = resolvedSearchParams.material ?? "none";
  const style = resolvedSearchParams.style ?? "none";
  const price = resolvedSearchParams.price ?? "all";
  const sort = resolvedSearchParams.sort ?? "none";

  // FILTER BY TITLE
  if (title === "all") {
    filtered = filtered;
  }

  if (title !== "all") {
    filtered = filtered.filter((item) =>
      item.title
        ?.toLowerCase()
        .startsWith(title.replace(/s$/, "").toLowerCase())
    );
  }

  // FILTER BY CATEGORY
  if (category !== "all") {
    filtered = filtered.filter((item) =>
      item.category
        ?.toLowerCase()
        .startsWith(category.replace(/s$/, "").toLowerCase())
    );
  }

  // FILTER BY WIG TYPE
  if (wigType !== "none") {
    filtered = filtered.filter((item) =>
      item.wigType
        ?.toLowerCase()
        .startsWith(wigType.replace(/s$/, "").toLowerCase())
    );
  }

  // FILTER BY MATERIAL
  if (material !== "none") {
    filtered = filtered.filter((item) =>
      item.material
        ?.toLowerCase()
        .startsWith(material.replace(/s$/, "").toLowerCase())
    );
  }

  // FILTER BY STYLE
  if (style !== "none") {
    filtered = filtered.filter((item) =>
      item.style
        ?.toLowerCase()
        .startsWith(style.replace(/s$/, "").toLowerCase())
    );
  }

  // FILTER BY PRICE RANGE
  if (price !== "all") {
    filtered = filtered.filter((item) => {
      const p = Number(item.price);
      switch (price) {
        case "low":
          return p <= 30000;
        case "mid-low":
          return p > 30000 && p <= 71000;
        case "mid":
          return p > 71000 && p <= 151000;
        case "high":
          return p > 151000 && p <= 200000;
        case "luxury":
          return p > 200000;
        default:
          return true;
      }
    });
  }

  // SORTING
  switch (sort) {
    case "price-asc":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      filtered.sort((a, b) => b.price - a.price);
      break;
    case "title-asc":
      filtered.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "title-desc":
      filtered.sort((a, b) => b.title.localeCompare(a.title));
      break;
  }

  return (
    <div className="grid grid-cols-1 justify-items-center sm:grid-cols-2 sm:mx-3  lg:grid-cols-3 lg:mx-2 xl:grid-cols-4 xl:mr-1 gap-x-6 gap-y-2 px-4 min-h-screen">
      {filtered.map((item) => (
        <Haircard item={item} key={item.id} />
      ))}
    </div>
  );
}

export default StoreItemList;
