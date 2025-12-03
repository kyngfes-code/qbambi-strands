import AddOrUpdateRow from "@/components/AddorUpdateRow";
import { Button } from "@/components/ui/button";
import { deleteSaloonWorkImages } from "@/lib/actions";
import { createClient } from "@supabase/supabase-js";

export default async function MakeupStudioImagePage({ params }) {
  const resolveParams = await params;
  const id = resolveParams.id;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // safe on server
  );

  // Fetch this specific  image row
  const { data, error } = await supabase
    .from("saloon-work-images")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return <p className="text-red-500">Error loading image: {error.message}</p>;
  }

  return (
    <div className="p-6 flex flex-col items-center justify-between">
      <h1 className="text-2xl font-semibold mb-6">Editing Image #{id}</h1>
      <div className="flex gap-x-4">
        <AddOrUpdateRow
          fetchUrl="/api/admin/update-saloon-images"
          imageData={data}
          id={id}
        />
        <form
          action={async () => {
            "use server";
            await deleteSaloonWorkImages(id);
          }}
        >
          <Button type="submit" variant="destructive">
            Delete card
          </Button>
        </form>
      </div>
    </div>
  );
}
