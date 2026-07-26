"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { storeItemImageEditor } from "@/lib/actions";
import { deleteStoreItem } from "@/lib/actions";

export default function Page() {
  const { id } = useParams();
  const router = useRouter();

  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload(e) {
    e.preventDefault();

    if (!file) {
      alert("Please select an image.");
      return;
    }

    setLoading(true);

    try {
      const fileName = `store-main-${id}-${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("hair-image")
        .upload(fileName, file, {
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("hair-image")
        .getPublicUrl(fileName);

      const result = await storeItemImageEditor({
        id,
        type: "store",
        imageUrl: data.publicUrl,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      alert("Image updated successfully.");

      router.refresh();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update image.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this product?")) return;

    await deleteStoreItem(id);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-6">
      <div className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full border transition hover:bg-neutral-100"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <h1 className="text-2xl font-semibold">Edit Store Image</h1>
        </div>
        <h1 className="mb-6 text-2xl font-semibold">Edit Store Image</h1>

        <form onSubmit={handleUpload}>
          <FieldGroup>
            <Field>
              <FieldLabel>New Image</FieldLabel>

              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const selected = e.target.files?.[0];

                  if (!selected) return;

                  setFile(selected);
                  setPreview(URL.createObjectURL(selected));
                }}
              />
            </Field>

            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-4 h-56 w-full rounded-2xl object-cover"
              />
            )}

            <Button type="submit" disabled={loading} className="mt-6 w-full">
              {loading ? "Uploading..." : "Update Image"}
            </Button>
          </FieldGroup>
        </form>

        <Button
          variant="destructive"
          onClick={handleDelete}
          className="mt-4 w-full"
        >
          Delete Product
        </Button>
      </div>
    </div>
  );
}
