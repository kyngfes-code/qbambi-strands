import { createClient } from "@supabase/supabase-js";
import ImageEditor from "./ImageEditor";

export default async function AdminImagePage({ params }) {
  const resolveParams = await params;
  const id = resolveParams.id;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // safe on server
  );

  // Fetch this specific homepage image row
  const { data, error } = await supabase
    .from("homePageImages")
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
