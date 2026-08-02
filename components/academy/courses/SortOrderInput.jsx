"use client";

import { useFormContext } from "react-hook-form";
import { Minus, Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function SortOrderInput({
  name = "sort_order",
  label = "Display Order",
  min = 0,
}) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const value = Number(watch(name) ?? 0);

  function increase() {
    setValue(name, value + 1, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function decrease() {
    if (value <= min) return;

    setValue(name, value - 1, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={decrease}
          disabled={value <= min}
        >
          <Minus className="h-4 w-4" />
        </Button>

        <Input
          id={name}
          type="number"
          min={min}
          className="text-center"
          {...register(name, { valueAsNumber: true })}
        />

        <Button type="button" variant="outline" size="icon" onClick={increase}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {errors[name] && (
        <p className="text-sm text-red-500">{errors[name]?.message}</p>
      )}

      <p className="text-xs text-neutral-500">
        Lower numbers appear first in the academy course list.
      </p>
    </div>
  );
}
