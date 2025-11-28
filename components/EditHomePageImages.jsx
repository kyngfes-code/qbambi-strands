"use client";

import { useState } from "react";
import Image from "next/image";

export default function EditHomePageImages({ hair }) {
  const [mainImage, setMainImage] = useState(hair.main_image);

  const [newMainFile, setNewMainFile] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("id", hair.id);

    if (newMainFile) {
      formData.append("main_image", newMainFile);
    }

    newExtraFiles.forEach((file) => {
      formData.append("extra_images", file);
    });

    const res = await fetch(`/api/hairs/update`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      alert("Hair updated successfully!");
    } else {
      alert("Failed to update hair.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[600px] space-y-6">
      <div>
        <label className="font-medium">Hair Title</label>
        <input
          className="block w-full border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* MAIN IMAGE */}
      <div>
        <label className="font-medium">Current Main Image</label>
        <div className="w-40 h-40 relative mb-2 border rounded overflow-hidden">
          <Image
            src={mainImage}
            alt="Main image"
            fill
            className="object-cover"
          />
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setNewMainFile(e.target.files[0])}
        />
      </div>

      {/* EXTRA IMAGES */}
      {/* <div>
        <label className="font-medium">Extra Images</label>

        <div className="flex gap-3 flex-wrap mb-3">
          {extraImages.map((img) => (
            <div
              key={img.id}
              className="w-24 h-24 relative border rounded overflow-hidden"
            >
              <Image
                src={img.image}
                alt="extra"
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setNewExtraFiles(Array.from(e.target.files))}
        />
      </div> */}

      <button
        type="submit"
        className="px-4 py-2 bg-pink-600 text-white rounded-md"
      >
        Save Changes
      </button>
    </form>
  );
}
