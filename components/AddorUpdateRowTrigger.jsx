"use client";

import { useState } from "react";
import AddOrUpdateRow from "./AddorUpdateRow";

export default function AddOrUpdateRowTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="w-[250px] sm:w-64 border rounded-3xl p-3 
                   shadow-md transition hover:-translate-y-2 hover:shadow-xl
                   cursor-pointer"
      >
        <div className="relative w-full h-64 rounded-xl flex items-center justify-center text-4xl">
          +
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-xl shadow-xl">
            <AddOrUpdateRow />
            <button
              onClick={() => setOpen(false)}
              className="mt-4 px-3 py-2 bg-gray-200 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
