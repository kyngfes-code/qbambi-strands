import AddOrUpdateRow from "@/components/AddorUpdateRow";
import { createClient } from "@supabase/supabase-js";

export default async function AdminImagePage({ params }) {
  const resolveParams = await params;
  const id = resolveParams.id;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // safe on server
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Editing Image #{id}</h1>

      <AddOrUpdateRow
        fetchUrl="/api/admin/update-saloon-heropage-images"
        id={id}
      />
    </div>
  );
}
