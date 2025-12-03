import SaloonImageCard from "@/components/SaloonImageCard";
import { getSaloonData } from "@/lib/data-service";
import Link from "next/link";

export default async function Page() {
  const data = await getSaloonData();
  const images = data.slice(0, 4);
  return (
    <div className="h-screen flex flex-col text-white">
      <section className="h-1/3 flex">
        <div className="w-2/3 flex p-4 ">
          {images.map((item) => (
            <SaloonImageCard
              href={`/admin/saloon/${item.id}`}
              src={item.images}
              key={item.id}
            />
          ))}
        </div>
      </section>
      <Link className="mt-10" href="/admin/saloon/images">
        <div>click to go to main saloon image page for update</div>
      </Link>
      <div className=" mt-4"></div>
    </div>
  );
}
