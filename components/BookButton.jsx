"use client";

import { useState } from "react";

export default function BookButton() {
  const [clicked, setClicked] = useState(false);

  return (
    <div>
      {!clicked ? (
        <button
          onClick={() => setClicked(true)}
          className="px-6 py-3 rounded-xl border border-white text-white font-bold hover:bg-white/20 transition"
        >
          Book Appointment
        </button>
      ) : (
        <p className="text-white font-bold text-lg">
          Call us: <span className="underline">07036308292</span>
        </p>
      )}
    </div>
  );
}
