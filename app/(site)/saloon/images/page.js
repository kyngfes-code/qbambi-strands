import FetchImage from "@/components/FetchImge";
import SaloonImageCard from "@/components/SaloonImageCard";

export const metadata = {
  title: "saloon / images",
};

async function page() {
  const { saloonWorkImageData } = await FetchImage();
  const data = saloonWorkImageData;

  return (
    <div className="flex">
      <div className=" ml-4 flex flex-wrap ">
        {data.map((item) => (
          <SaloonImageCard
            key={item.id}
            src={item.images}
            title={item.title}
            description={item.description}
            className="mt-8 w-48! h-60"
            noBg
            noClick
            noHref
          />
        ))}
      </div>
    </div>
  );
}

export default page;
