"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteStoreItem } from "@/lib/actions";

export default function DeleteStoreProductButton({ productId, productTitle }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${productTitle}"?\n\nThis will permanently remove the product and all of its images. This action cannot be undone.`,
    );

    if (!confirmed) return;

    startTransition(async () => {
      try {
        await deleteStoreItem(productId);
      } catch (err) {
        console.error(err);
        alert("Failed to delete product.");
      }
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleDelete}
      className="
        inline-flex items-center justify-center gap-2
        rounded-xl border border-red-200
        px-3 py-2
        text-sm font-medium text-red-600
        transition
        hover:bg-red-50
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    >
      <Trash2 className="h-4 w-4" />

      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
