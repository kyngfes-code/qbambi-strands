import { createSupabaseServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req) {
  const supabase = await createSupabaseServerClient();
  const formData = await req.formData();

  const file = formData.get("file");
  const id = formData.get("id");

  if (!file || !id) {
    return NextResponse.json({ error: "Missing file or id" }, { status: 400 });
  }

  const fileName = `saloon-${id}-${Date.now()}`;

  // Get old image first
  const { data: oldRow, error: fetchError } = await supabase
    .from("saloon")
    .select("images")
    .eq("id", id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError }, { status: 500 });
  }

  const oldImageUrl = oldRow?.images;

  // 2. UPLOAD TO STORAGE
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("hair-image")
    .upload(fileName, file, { upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError }, { status: 500 });
  }

  // 2. GET PUBLIC URL
  const { data: publicUrlData } = supabase.storage
    .from("hair-image")
    .getPublicUrl(uploadData.path);

  // 3. UPDATE DATABASE
  const { error: dbError } = await supabase
    .from("saloon")
    .update({ images: publicUrlData.publicUrl })
    .eq("id", id);

  if (dbError) {
    return NextResponse.json({ error: dbError }, { status: 500 });
  }

  if (oldImageUrl) {
    try {
      const oldPath = oldImageUrl.split("/hair-image/")[1];

      if (oldPath) {
        await supabase.storage.from("hair-image").remove([oldPath]);
      }
    } catch (err) {
      console.log("Failed to delete old image:", err);
      // DO NOT FAIL REQUEST — user already has new image
    }
  }

  revalidatePath("/admin/saloon");
  return NextResponse.json({ success: true, redirect: "/admin/saloon" });
}
