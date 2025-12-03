"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddOrUpdateRow({ id = null, fetchUrl }) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      alert("Please choose an image.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (id) formData.append("id", id);

      const res = await fetch(fetchUrl, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        console.error(result.error);
        alert("Upload failed");
        return;
      } else {
        alert(id ? "Image updated!" : "New image added!");
        setFile(null);
        router.push(result.redirect);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    }
    setUploading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border rounded-xl p-4 flex flex-col gap-3 bg-white"
    >
      <h2 className="text-lg font-semibold">
        {id ? "Update Image" : "Add New Image"}
      </h2>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        className="p-2 border rounded"
      />

      {file && (
        <div>
          <h3 className="mb-2 font-medium">Current Image</h3>
          <img
            src={URL.createObjectURL(file)}
            alt="preview"
            className="w-[380px] h-auto rounded-lg shadow"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={uploading}
        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
      >
        {uploading ? "Uploading..." : id ? "Update Image" : "Add Image"}
      </button>
    </form>
  );
}
