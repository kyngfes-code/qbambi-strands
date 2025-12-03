import FetchImage from "@/components/FetchImge";
import FormSaloonImages from "@/components/FormSaloonImages";
import SaloonImageCard from "@/components/SaloonImageCard";

async function page() {
  const { saloonWorkImageData } = await FetchImage();
  const data = saloonWorkImageData;

  return (
    <div className="p-6 flex flex-col gap-6">
      <h2 className="text-2xl font-semibold">
        Click on an image to edit the image card
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((item) => (
              <SaloonImageCard
                key={item.id}
                src={item.images}
                title={item.title}
                description={item.description}
                className="h-56"
                noBg
                noClick
                href={`/admin/saloon/images/${item.id}`}
              />
            ))}
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white/5 rounded-xl p-4 shadow-md border border-white/10">
            <FormSaloonImages />
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;
