import HaircardAdmin from "@/components/HaircardAdmin";

export default async function Page() {
  const extraImages = await getStoreItemExtraImages();
  if (!extraImages.length) return null;

  return (
    <div className="relative flex w-full">
      <main className="w-full pl-4 lg:pl-4 px-4 py-4 xl:pl-4">
        <div className="grid grid-cols-1 justify-items-center sm:grid-cols-2 sm:mx-3  lg:grid-cols-3 lg:mx-2 xl:grid-cols-4 xl:mr-1 gap-x-6 gap-y-2 px-4 min-h-screen">
          {extraImages.map((img) => (
            <HaircardAdmin hair={img} key={img.id} />
          ))}
        </div>
      </main>
    </div>
  );
}
