import { supabase } from "./supabase";

export async function getStoreItems() {
  const { data: storeItems, error } = await supabase
    .from("store")
    .select(
      `
      id,
      title,
      description,
      category,
      wigType,
      material,
      style,
      price,
      status,
      quantity,
      main_image:image,
      extra_images:hairimages(id, image)
    `
    )
    .order("title");

  if (error) {
    console.error(error);
    throw new Error("Images could not be loaded");
  }

  return storeItems;
}

export async function getStoreItemExtraImages() {
  const { data, error } = await supabase.from("hairimages").select("image");

  if (error) {
    console.error(error);
    throw new Error("Images could not be loaded");
  }

  return data;
}

export async function getMakeUpImages() {
  const { data: images, error } = await supabase
    .from("make-up-images")
    .select("images, id");
  if (error) {
    console.error(error);
    throw new Error("Make up images could not be loaded");
  }

  return images;
}

export async function getHomePageImages() {
  const { data, error } = await supabase.from("homePageImages").select("*");
  if (error) {
    console.error("Failed to load images:", error.message);
    return null;
  }

  return data;
}

export async function getAcademyData() {
  const { data, error } = await supabase.from("academy").select("*");
  if (error) {
    console.error(error);
    throw new Error("academy images could not be loaded");
  }

  return data;
}
export async function getSaloonData() {
  const { data, error } = await supabase.from("saloon").select("*");
  if (error) {
    console.error(error);
    throw new Error("saloon images could not be loaded");
  }

  return data;
}
export async function getSaloonWorkImages() {
  const { data, error } = await supabase
    .from("saloon-work-images")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error(error);
    throw new Error("saloon images could not be loaded");
  }

  return data;
}
export async function getUserCart() {
  const res = await fetch("/api/cart");

  if (!res.ok) {
    throw new Error("Unauthorized");
  }

  return res.json();
}
