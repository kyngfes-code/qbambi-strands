"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { createStoreItems } from "@/lib/actions";
import { supabase } from "@/lib/supabase";

function FormShopItems() {
  const form = useForm();

  const [previewMain, setPreviewMain] = useState(null);
  const [previewExtra, setPreviewExtra] = useState([]);

  const [highlights, setHighlights] = useState([""]);
  const [careGuide, setCareGuide] = useState([""]);

  function updateHighlight(index, value) {
    const copy = [...highlights];
    copy[index] = value;
    setHighlights(copy);
  }

  function addHighlight() {
    setHighlights([...highlights, ""]);
  }

  function removeHighlight(index) {
    setHighlights(highlights.filter((_, i) => i !== index));
  }

  function updateCare(index, value) {
    const copy = [...careGuide];
    copy[index] = value;
    setCareGuide(copy);
  }

  function addCare() {
    setCareGuide([...careGuide, ""]);
  }

  function removeCare(index) {
    setCareGuide(careGuide.filter((_, i) => i !== index));
  }

  async function onSubmit(data) {
    try {
      const mainImage = data.mainImage?.[0];

      if (!mainImage) throw new Error("Main image required");

      const mainFileName = `store-main-${Date.now()}-${mainImage.name}`;

      const { error: mainUploadError } = await supabase.storage
        .from("hair-image")
        .upload(mainFileName, mainImage);

      if (mainUploadError) throw mainUploadError;

      const { data: mainUrl } = supabase.storage
        .from("hair-image")
        .getPublicUrl(mainFileName);

      const extraImageUrls = [];

      if (data.extraImages?.length) {
        for (const file of data.extraImages) {
          const fileName = `store-extra-${Date.now()}-${file.name}`;

          const { error } = await supabase.storage
            .from("hair-image")
            .upload(fileName, file);

          if (error) throw error;

          const { data } = supabase.storage
            .from("hair-image")
            .getPublicUrl(fileName);

          extraImageUrls.push(data.publicUrl);
        }
      }

      await createStoreItems({
        title: data.title,
        category: data.category,
        wigType: data.wigType || null,
        style: data.style || null,
        material: data.material || null,

        quantity: Number(data.quantity),
        price: Number(data.price),

        description: data.description,

        highlights: highlights.filter(Boolean),

        qualityStatement: data.qualityStatement,

        careGuide: careGuide.filter(Boolean),

        mainImageUrl: mainUrl.publicUrl,

        extraImageUrls,
      });

      alert("✅ Product created!");

      form.reset();

      setPreviewMain(null);
      setPreviewExtra([]);
      setHighlights([""]);
      setCareGuide([""]);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  }

  return (
    <Card className="mx-auto mt-8 max-w-4xl rounded-3xl">
      <CardHeader>
        <CardTitle className="text-2xl">Create Store Product</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          {/* BASIC */}
          <FieldGroup className="grid gap-5 md:grid-cols-2">
            <Field>
              <FieldLabel>Title</FieldLabel>
              <Input {...form.register("title")} />
            </Field>

            <Field>
              <FieldLabel>Category</FieldLabel>
              <Input {...form.register("category")} />
            </Field>

            <Field>
              <FieldLabel>Wig Type</FieldLabel>
              <Input {...form.register("wigType")} />
            </Field>

            <Field>
              <FieldLabel>Style</FieldLabel>
              <Input {...form.register("style")} />
            </Field>

            <Field>
              <FieldLabel>Material</FieldLabel>
              <Input {...form.register("material")} />
            </Field>

            <Field>
              <FieldLabel>Quantity</FieldLabel>
              <Input type="number" {...form.register("quantity")} />
            </Field>

            <Field>
              <FieldLabel>Price</FieldLabel>
              <Input type="number" {...form.register("price")} />
            </Field>
          </FieldGroup>

          {/* DESCRIPTION */}

          <Field>
            <FieldLabel>Description</FieldLabel>

            <Textarea rows={5} {...form.register("description")} />
          </Field>

          {/* HIGHLIGHTS */}

          <div className="space-y-3">
            <FieldLabel>Highlights</FieldLabel>

            {highlights.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={item}
                  placeholder="e.g. HD Lace"
                  onChange={(e) => updateHighlight(index, e.target.value)}
                />

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeHighlight(index)}
                >
                  Remove
                </Button>
              </div>
            ))}

            <Button type="button" variant="secondary" onClick={addHighlight}>
              + Add Highlight
            </Button>
          </div>

          {/* QUALITY */}

          <Field>
            <FieldLabel>Quality Statement</FieldLabel>

            <Textarea rows={4} {...form.register("qualityStatement")} />
          </Field>

          {/* CARE */}

          <div className="space-y-3">
            <FieldLabel>Care Guide</FieldLabel>

            {careGuide.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={item}
                  placeholder="e.g. Air dry naturally"
                  onChange={(e) => updateCare(index, e.target.value)}
                />

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeCare(index)}
                >
                  Remove
                </Button>
              </div>
            ))}

            <Button type="button" variant="secondary" onClick={addCare}>
              + Add Care Tip
            </Button>
          </div>

          {/* MAIN IMAGE */}

          <Field>
            <FieldLabel>Main Image</FieldLabel>

            <Input
              type="file"
              accept="image/*"
              {...form.register("mainImage")}
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (file) {
                  setPreviewMain(URL.createObjectURL(file));
                }
              }}
            />

            {previewMain && (
              <img
                src={previewMain}
                className="aspect-square w-full max-w-xs rounded-xl object-cover"
              />
            )}
          </Field>

          {/* EXTRA */}

          <Field>
            <FieldLabel>Extra Images</FieldLabel>

            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);

                const current = form.getValues("extraImages") || [];

                form.setValue("extraImages", [...current, ...files]);

                setPreviewExtra((prev) => [
                  ...prev,
                  ...files.map((f) => URL.createObjectURL(f)),
                ]);

                e.target.value = "";
              }}
            />

            <div className="mt-4 max-h-64 overflow-y-auto rounded-xl border bg-neutral-50 p-3">
              <div className="grid grid-cols-3 gap-3">
                {previewExtra.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            </div>
          </Field>

          <Button type="submit" className="w-full">
            Create Product
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default FormShopItems;
