import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(req) {
  const supabase = await createSupabaseServerClient();
  const formData = await req.formData();

  const file = formData.get("file");
  const id = formData.get("id"); // if null → INSERT

  if (!file) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  let rowId = id;
  let oldImageUrl = null;

  // ----------------------------------------
  // CASE 1: INSERT NEW ROW FIRST (no id)
  // ----------------------------------------
  if (!id) {
    const { data: row, error: insertError } = await supabase
      .from("saloon-work-images") //table
      .insert([{ images: "" }])
      .select("id")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError }, { status: 500 });
    }

    rowId = row.id; // using the new generated id
  }

  // ----------------------------------------
  // CASE 2: FETCH OLD IMAGE IF UPDATING
  // ----------------------------------------
  if (id) {
    const { data: oldRow, error: fetchError } = await supabase
      .from("saloon-work-images") //table
      .select("images")
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError }, { status: 500 });
    }

    oldImageUrl = oldRow?.images;
  }

  // ----------------------------------------
  // UPLOAD NEW FILE
  // ----------------------------------------
  const fileName = `saloon-${rowId}-${Date.now()}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("saloon") //storage bucket name
    .upload(fileName, file, { upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage // this is to get the image url that will be use to update the table row
    .from("saloon")
    .getPublicUrl(uploadData.path);

  // ----------------------------------------
  // UPDATE ROW WITH NEW IMAGE URL
  // ----------------------------------------
  const { error: dbError } = await supabase
    .from("saloon-work-images") //table name
    .update({ images: publicUrlData.publicUrl })
    .eq("id", rowId);

  if (dbError) {
    return NextResponse.json({ error: dbError }, { status: 500 });
  }

  // ----------------------------------------
  // DELETE OLD FILE (ONLY ON UPDATE)
  // ----------------------------------------
  if (oldImageUrl) {
    try {
      const oldPath = oldImageUrl.split("/saloon/")[1];
      if (oldPath) {
        await supabase.storage.from("saloon").remove([oldPath]);
      }
    } catch (err) {
      console.log("Failed to delete old image:", err);
    }
  }

  return NextResponse.json({
    success: true,
    id: rowId,
    imageUrl: publicUrlData.publicUrl,
    updated: Boolean(id),
    created: !id,
  });
}
