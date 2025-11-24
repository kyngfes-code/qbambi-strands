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

// export async function getHairAllImages(hairId) {
//   const { data: hairsAllImages, error } = await supabase
//     .from("hairs")
//     .select(
//       `
//     id,
//     title,
//     description,
//     main_image:image,
//     extra_images:hairImages(image)
//   `
//     )
//     .eq("id", hairId)
//     .single();

//   if (error) {
//     console.error(error);
//     throw new Error("HairsAllImages could not be loaded");
//   }

//   return hairsAllImages;
// }

export async function getMakeUpImages() {
  const { data: images, error } = await supabase
    .from("make-up-images")
    .select("images");
  if (error) {
    console.error(error);
    throw new Error("Hairs could not be loaded");
  }

  return images;
}

export async function getHomePageImagesAcademy() {
  const { data: images, error } = await supabase
    .from("homePageImagesAcademy")
    .select("images");
  if (error) {
    console.error(error);
    throw new Error("HomePageImages Academy could not be loaded");
  }

  return images;
}
export async function getHomePageImagesSaloon() {
  const { data: images, error } = await supabase
    .from("homePageImagesSaloon")
    .select("images");
  if (error) {
    console.error(error);
    throw new Error("HomePageImages Saloon images could not be loaded");
  }

  return images;
}
export async function getHomePageImagesMakeup() {
  const { data: images, error } = await supabase
    .from("homePageImagesMakeUp")
    .select("images");
  if (error) {
    console.error(error);
    throw new Error("HomePageImages Saloon images could not be loaded");
  }

  return images;
}
export async function getHomePageImagesHairs() {
  const { data: images, error } = await supabase
    .from("homePageImagesHairs")
    .select("images");
  if (error) {
    console.error(error);
    throw new Error("HomePageImages Saloon images could not be loaded");
  }

  return images;
}
export async function getAcademyData() {
  const { data, error } = await supabase.from("academy").select("*");
  if (error) {
    console.error(error);
    throw new Error("academy images could not be loaded");
  }

  return data;
}
