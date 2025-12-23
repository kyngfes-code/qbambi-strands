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
      .from("hairimages")
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
      .from("hairimages")
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

export async function createStoreItems({
  title,
  description,
  price,
  category,
  wigType,
  material,
  style,
  quantity,
  mainImageUrl,
  extraImageUrls,
}) {
  const supabase = await supabaseServer();

  // ✅ 1️⃣ Create store item
  const { data: newStore, error: storeError } = await supabase
    .from("store")
    .insert([
      {
        title,
        description,
        price,
        category,
        wigType,
        material,
        style,
        quantity,
        image: mainImageUrl,
      },
    ])
    .select()
    .single();

  if (storeError) throw new Error("Failed to create store item");

  // ✅ 2️⃣ Insert extra images
  if (extraImageUrls?.length > 0) {
    const payload = extraImageUrls.map((url) => ({
      image: url,
      store_id: newStore.id,
    }));

    const { error: imageError } = await supabase
      .from("hairimages")
      .insert(payload);

    if (imageError) throw new Error("Failed to save extra images");
  }

  return newStore;
}

export async function deleteStoreItem(id) {
  const supabase = await supabaseServer();

  // 1️⃣ Get main image + linked hair images
  const { data: row, error: fetchError } = await supabase
    .from("store")
    .select("image, hairimages(image)")
    .eq("id", id)
    .single();

  if (fetchError) throw new Error("Could not fetch image row");

  // 2️⃣ Collect ALL image paths (store + linked images)
  const imagePaths = [];

  // Main store image
  if (row?.image) {
    const mainPath = row.image.split("/object/public/hair-image/")[1];
    if (mainPath) imagePaths.push(mainPath);
  }

  // Linked hair images (array)
  if (row?.hairimages?.length) {
    row.hairimages.forEach((img) => {
      const linkedPath = img.image?.split("/object/public/hair-image/")[1];
      if (linkedPath) imagePaths.push(linkedPath);
    });
  }

  // 3️⃣ Delete DB row first (linked rows auto-delete via cascade)
  const { error: deleteRowError } = await supabase
    .from("store")
    .delete()
    .eq("id", id);

  if (deleteRowError) throw new Error("Image card could not be deleted");

  // 4️⃣ Delete ALL images from storage
  if (imagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("hair-image")
      .remove(imagePaths);

    if (storageError) {
      throw new Error(
        "One or more image files could not be deleted from bucket"
      );
    }
  }

  // 5️⃣ Refresh UI
  revalidatePath("/admin/shop");
  redirect("/admin/shop");

  return { success: true };
}

export async function getAllPaymentPlans() {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("payment_plans")
    .select(
      `
      id,
      user_id,
      plan_type,
      original_price,
      total_amount,
      amount_paid,
      outstanding_balance,
      status,
      created_at
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getAdminKpis() {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc("admin_payment_kpis");

  if (error) throw new Error(error.message);
  return data?.[0] ?? null;
}

export async function getOverdueInstalments() {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("instalments")
    .select(
      `
      id,
      payment_plan_id,
      due_date,
      amount,
      amount_paid,
      penalty_applied_count,
      payment_plans (
        user_id
      )
    `
    )
    .eq("paid", false)
    .lt("due_date", new Date().toISOString())
    .order("due_date");

  if (error) throw new Error(error.message);
  return data;
}

export async function getPaymentHistory() {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("payment_history")
    .select(
      `
      id,
      payment_plan_id,
      amount,
      status,
      created_at,
      payment_plans (
        user_id
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getUserFinancialSummary() {
  const supabase = await supabaseServer();

  const { data, error } = await supabase.from("payment_plans").select(`
      user_id,
      total_amount,
      amount_paid,
      outstanding_balance
    `);

  if (error) throw new Error(error.message);

  const summary = Object.values(
    data.reduce((acc, p) => {
      acc[p.user_id] ??= {
        user_id: p.user_id,
        plans_count: 0,
        total_expected: 0,
        total_paid: 0,
        total_outstanding: 0,
      };

      acc[p.user_id].plans_count++;
      acc[p.user_id].total_expected += p.total_amount;
      acc[p.user_id].total_paid += p.amount_paid;
      acc[p.user_id].total_outstanding += p.outstanding_balance;

      return acc;
    }, {})
  );

  return summary.sort((a, b) => b.total_outstanding - a.total_outstanding);
}

export async function getDefaultedPlans() {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("payment_plans")
    .select(
      `
      id,
      user_id,
      plan_type,
      amount_paid,
      total_amount,
      status,
      created_at
    `
    )
    .eq("status", "defaulted")
    .order("created_at");

  if (error) throw new Error(error.message);
  return data;
}

export async function getInstalmentPerformance() {
  const supabase = await supabaseServer();

  const { data, error } = await supabase.rpc("admin_instalment_performance");

  if (error) throw new Error(error.message);
  return data;
}
