import ImageEditor from "@/components/ImageEditor";
import { createClient } from "@supabase/supabase-js";

export default async function MakeupStudioImagePage({ params }) {
  const resolveParams = await params;
  const id = resolveParams.id;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // safe on server
  );

  // Fetch this specific makeuppage image row
  const { data, error } = await supabase
    .from("make-up-images")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return <p className="text-red-500">Error loading image: {error.message}</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Editing Image #{id}</h1>

      <ImageEditor imageData={data} />
    </div>
  );
}
