import { getHomePageImages, getSaloonWorkImages } from "@/lib/data-service";

async function FetchImage() {
  const homePageImageData = await getHomePageImages();
  const saloonWorkImageData = await getSaloonWorkImages();

  const saloonImagesData = homePageImageData.filter((item) =>
    item.title.startsWith("Saloon")
  );
  const saloonImages = saloonImagesData.slice(0, 4);

  const academyImageData = homePageImageData.filter((item) =>
    item.title.startsWith("Academy")
  );
  const academyImage = academyImageData.slice(0, 1);

  const makeupImageData = homePageImageData.filter((item) =>
    item.title.startsWith("Makeup")
  );
  const makeupImages = makeupImageData.slice(0, 4);

  const hairImageData = homePageImageData.filter((item) =>
    item.title.startsWith("Hair")
  );
  const hairImages = hairImageData.slice(0, 4);

  return {
    saloonImages,
    academyImage,
    makeupImages,
    hairImages,
    saloonWorkImageData,
  };
}

export default FetchImage;
