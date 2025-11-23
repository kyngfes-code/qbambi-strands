import { supabase } from "./supabase";

// export async function getHairs(params) {
//   const { data: hairs, error } = await supabase
//     .from("hairs")
//     .select("*")
//     .order("title");

//   if (error) {
//     console.error(error);
//     throw new Error("Hairs could not be loaded");
//   }

//   return hairs;
// }

export async function getHairs() {
  const { data: hairs, error } = await supabase
    .from("hairs")
    .select(
      `
      id,
      title,
      description,
      price,
      status,
      main_image:image,
      extra_images:hairImages(image)
    `
    )
    .order("title");

  if (error) {
    console.error(error);
    throw new Error("Hairs could not be loaded");
  }

  return hairs;
}

export async function getHairAllImages(hairId) {
  const { data: hairsAllImages, error } = await supabase
    .from("hairs")
    .select(
      `
    id,
    title,
    description,
    main_image:image,
    extra_images:hairImages(image)
  `
    )
    .eq("id", hairId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("HairsAllImages could not be loaded");
  }

  return hairsAllImages;
}

export async function getMakeUpImages() {
  const { data: images, error } = await supabase
    .from("make-up-images")
    .select("*");
  if (error) {
    console.error(error);
    throw new Error("Hairs could not be loaded");
  }

  return images;
}
