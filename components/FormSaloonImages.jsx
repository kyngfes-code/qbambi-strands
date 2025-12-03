"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Field, FieldGroup, FieldLabel, FieldError } from "./ui/field";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

import { createSaloonWorkImages } from "@/lib/actions";
import { useTransition } from "react";
import { toast } from "sonner";

export default function FormSaloonImages() {
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    startTransition(async () => {
      const result = await createSaloonWorkImages(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Image uploaded successfully!");
    });
  }
  return (
    <Card className="max-w-md mx-auto mt-6">
      <CardHeader>
        <CardTitle>Upload New Image</CardTitle>
      </CardHeader>

      <CardContent>
        <form action={handleAction} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input id="title" name="title" />
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea id="description" name="description" />
            </Field>

            <Field>
              <FieldLabel htmlFor="file">Upload Image</FieldLabel>
              <Input id="file" name="file" type="file" accept="image/*" />
            </Field>

            <Button type="submit">Create</Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
