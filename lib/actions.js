"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function supabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function createSaloonWorkImages(formData) {
  const supabase = await supabaseServer();
  try {
    const title = formData.get("title");
    const description = formData.get("description");
    const file = formData.get("file");

    if (!file || file.size === 0) {
      throw new Error("No image uploaded");
    }

    // 1️⃣ Upload to Supabase Storage
    const fileName = `saloonwork-${Date.now()}-${file.name}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("saloon")
      .upload(fileName, file, {
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error("Image upload failed: " + uploadError.message);
    }

    // 2️⃣ Construct public URL
    const { data: urlData } = supabase.storage
      .from("saloon")
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    // 3️⃣ Insert DB row
    const { error } = await supabase.from("saloon-work-images").insert({
      title,
      description,
      images: publicUrl,
    });

    if (error) {
      throw new Error("Image card could not be created");
    }
    revalidatePath("/admin/saloon/images");
    return { success: true };
  } catch (error) {
    return { error: "unexpected error ocurred" };
  }
}

export async function deleteSaloonWorkImages(id) {
  const supabase = await supabaseServer();
  // Get the row first so we know the image path
  const { data: row, error: fetchError } = await supabase
    .from("saloon-work-images")
    .select("images")
    .eq("id", id)
    .single();

  if (fetchError) throw new Error("Could not fetch image row");

  // Extract file path in bucket
  const publicUrl = row?.images;
  const imagePath = publicUrl.split("/object/public/saloon/")[1];

  // Delete row from database
  const { error: deleteRowError } = await supabase
    .from("saloon-work-images")
    .delete()
    .eq("id", id);

  if (deleteRowError) throw new Error("Image card could not be deleted");

  // Delete image file from bucket
  if (imagePath) {
    const { error: storageError } = await supabase.storage
      .from("saloon")
      .remove([imagePath]);

    if (storageError) {
      throw new Error("Image file could not be deleted from bucket");
    }
  }
  revalidatePath("/admin/saloon/images");
  redirect("/admin/saloon/images");

  return { success: true };
}

export default async function storeItemImageEditor(formData) {
  const supabase = await supabaseServer();

  const id = formData.get("id");
  const type = formData.get("type");
  const file = formData.get("file");

  if (!id || !file || !type) {
    return { error: "Missing file, id, or type" };
  }

  const fileName = `storeimages-${id}-${Date.now()}`;

  // 1️⃣ Fetch old image based on type
  let oldImageUrl = null;

  if (type === "store") {
    const { data } = await supabase
      .from("store")
      .select("image")
      .eq("id", id)
      .single();

    oldImageUrl = data?.image || null;
  }

  if (type === "extra") {
    const { data } = await supabase
      .from("hairImages")
      .select("image")
      .eq("id", id)
      .single();

    oldImageUrl = data?.image || null;
  }

  // 2️⃣ Upload new image
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("hair-image")
    .upload(fileName, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data: publicUrlData } = supabase.storage
    .from("hair-image")
    .getPublicUrl(uploadData.path);

  const newUrl = publicUrlData.publicUrl;

  // 3️⃣ Update correct table
  let dbError;
  if (type === "store") {
    const { error } = await supabase
      .from("store")
      .update({ image: newUrl })
      .eq("id", id);
    dbError = error;
  }

  if (type === "extra") {
    const { error } = await supabase
      .from("hairImages")
      .update({ image: newUrl })
      .eq("id", id);
    dbError = error;
  }

  if (dbError) return { error: dbError.message };

  // 4️⃣ Delete old file
  if (oldImageUrl) {
    try {
      const oldPath = oldImageUrl.split("/hair-image/")[1];
      if (oldPath) {
        await supabase.storage.from("hair-image").remove([oldPath]);
      }
    } catch (err) {
      console.log("Failed to delete old image:", err);
    }
  }

  revalidatePath("/admin/shop");
  return { success: true };
}
