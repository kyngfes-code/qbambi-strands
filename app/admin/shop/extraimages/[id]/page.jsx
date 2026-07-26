"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { storeItemImageEditor } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function ExtraImageEditorPage() {
  const { id } = useParams();
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload(e) {
    e.preventDefault();

    if (!file) {
      alert("Please select an image.");
      return;
    }

    try {
      setLoading(true);

      const fileName = `store-extra-${id}-${Date.now()}-${file.name}`;

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
        type: "extra",
        imageUrl: data.publicUrl,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      alert("Extra image updated successfully.");

      router.refresh();
      router.push("/admin/shop");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update image.");
    } finally {
      setLoading(false);
    }
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
        <h1 className="mb-2 text-2xl font-semibold">
          Edit Extra Product Image
        </h1>

        <p className="mb-6 text-sm text-neutral-500">
          Replace this gallery image with a new one.
        </p>

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
                className="mt-4 h-64 w-full rounded-2xl object-cover"
              />
            )}

            <Button type="submit" disabled={loading} className="mt-6 w-full">
              {loading ? "Uploading..." : "Update Image"}
            </Button>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
