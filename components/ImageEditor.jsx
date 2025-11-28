"use client";

import { useState } from "react";

export default function ImageEditor({ imageData }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(imageData.images);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    // Show preview immediately
    const tempURL = URL.createObjectURL(file);
    setPreview(tempURL);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("id", imageData.id);

    const res = await fetch("/api/admin/update-makeup-studio-images", {
      method: "POST",
      body: formData,
    });

    setUploading(false);

    if (!res.ok) {
      alert("Upload failed");
    } else {
      alert("Image updated successfully!");
    }
  }

  return (
    <div className="flex gap-10 items-start">
      {/* CURRENT IMAGE */}
      <div>
        <h3 className="mb-2 font-medium">Current Image</h3>
        <img
          src={preview}
          alt="Preview"
          className="w-[380px] h-auto rounded-lg shadow"
        />
      </div>

      {/* FILE UPLOADER */}
      <div className="flex flex-col gap-4">
        <label className="font-medium">Upload new image</label>

        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="border p-2 rounded cursor-pointer"
        />

        {uploading && <p className="text-blue-500">Uploading...</p>}
      </div>
    </div>
  );
}
