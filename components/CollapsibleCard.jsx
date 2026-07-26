"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function CollapsibleCard({
  title,
  description,
  defaultOpen = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>

          {description && (
            <p className="mt-1 text-sm text-neutral-500">{description}</p>
          )}
        </div>

        {open ? (
          <ChevronDown className="h-5 w-5" />
        ) : (
          <ChevronRight className="h-5 w-5" />
        )}
      </button>

      {open && <div className="border-t p-5">{children}</div>}
    </div>
  );
}
