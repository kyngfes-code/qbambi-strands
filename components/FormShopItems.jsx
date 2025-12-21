"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createStoreItems } from "@/lib/actions";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useForm } from "react-hook-form";

function FormShopItems() {
  const form = useForm();
  const [previewMain, setPreviewMain] = useState(null);
  const [previewExtra, setPreviewExtra] = useState([]);

  async function onSubmit(data) {
    try {
      // ✅ 1️⃣ Upload MAIN image directly
      const mainImage = data.mainImage?.[0];

      if (!mainImage) throw new Error("Main image required");

      const mainFileName = `store-main-${Date.now()}-${mainImage.name}`;

      const { error: mainUploadError } = await supabase.storage
        .from("hair-image")
        .upload(mainFileName, mainImage, {
          contentType: mainImage.type,
        });

      if (mainUploadError) throw mainUploadError;

      const { data: mainUrl } = supabase.storage
        .from("hair-image")
        .getPublicUrl(mainFileName);

      const mainImageUrl = mainUrl.publicUrl;

      // ✅ 2️⃣ Upload EXTRA images directly
      const extraImageUrls = [];

      if (data.extraImages?.length > 0) {
        for (const img of data.extraImages) {
          const extraFileName = `store-extra-${Date.now()}-${img.name}`;

          const { error: extraError } = await supabase.storage
            .from("hair-image")
            .upload(extraFileName, img, {
              contentType: img.type,
            });

          if (extraError) throw extraError;

          const { data: extraUrlData } = supabase.storage
            .from("hair-image")
            .getPublicUrl(extraFileName);

          extraImageUrls.push(extraUrlData.publicUrl);
        }
      }
      console.log("Extra images:", data.extraImages);

      // ✅ 3️⃣ Send ONLY URLs to server action
      await createStoreItems({
        title: data.title,
        category: data.category,
        wigType: data.wigType || null,
        description: data.description,
        price: data.price,
        material: data.material || null,
        style: data.style || null,
        quantity: data.quantity,
        mainImageUrl,
        extraImageUrls,
      });

      alert("✅ Store item created successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Upload failed");
    }
  }
  return (
    <div>
      <Card className="max-w-md mx-auto mt-6">
        <CardHeader>
          <CardTitle>Create New Store Item</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  {...form.register("title")}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="category">Category</FieldLabel>
                <Input
                  id="category"
                  name="category"
                  type="text"
                  {...form.register("category")}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="wigType">Wig Type</FieldLabel>
                <Input
                  id="wigType"
                  name="wigType"
                  type="text"
                  {...form.register("wigType")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="style">Style</FieldLabel>
                <Input
                  id="style"
                  name="style"
                  type="text"
                  {...form.register("style")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="material">Material</FieldLabel>
                <Input
                  id="material"
                  name="material"
                  type="text"
                  {...form.register("material")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="quantity">Qty</FieldLabel>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  {...form.register("quantity")}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="price">Price</FieldLabel>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  {...form.register("price")}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea
                  id="description"
                  name="description"
                  type="text"
                  placeholder="be detailed and concise eg glueless, glue-down"
                  {...form.register("description")}
                />
              </Field>
              <Field>
                <FieldLabel>Main Image</FieldLabel>
                <Input
                  type="file"
                  accept="image/*"
                  {...form.register("mainImage")}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setPreviewMain(URL.createObjectURL(file));
                  }}
                />

                {previewMain && (
                  <img
                    src={previewMain}
                    className="w-40 h-40 object-cover rounded-lg mt-2"
                  />
                )}
              </Field>

              <Field>
                <FieldLabel>Extra Images</FieldLabel>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const newFiles = Array.from(e.target.files || []);

                    // ✅ 1️⃣ APPEND to existing React Hook Form value
                    const currentFiles = form.getValues("extraImages") || [];
                    const updatedFiles = [...currentFiles, ...newFiles];

                    form.setValue("extraImages", updatedFiles, {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    });

                    // ✅ 2️⃣ APPEND previews
                    const previews = newFiles.map((file) =>
                      URL.createObjectURL(file)
                    );
                    setPreviewExtra((prev) => [...prev, ...previews]);

                    // ✅ 3️⃣ Reset input so same file can be selected again
                    e.target.value = "";
                  }}
                />

                {previewExtra.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {previewExtra.map((src, index) => (
                      <img
                        key={index}
                        src={src}
                        className="w-28 h-28 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </Field>

              <Button type="submit">Create</Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default FormShopItems;
