"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react"; // icon for retry
import { AlertTriangle } from "lucide-react"; // cute warning icon

export default function Error({ error }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div
        className="flex flex-col items-center text-center gap-6 p-8 
                      rounded-2xl shadow-2xl bg-white/70 backdrop-blur-xl 
                      animate-fadeIn border border-white/40"
      >
        {/* Cute icon */}
        <div className="p-4 rounded-full bg-[#ffe5ed] shadow-inner">
          <AlertTriangle className="w-10 h-10 text-[#ff7aa2]" />
        </div>

        <h1 className="text-3xl font-extrabold text-[#ff7aa2] drop-shadow-sm">
          Something went wrong
        </h1>

        <p className="text-gray-700 max-w-md text-lg">
          An error occurred while loading this page. Please try again.
        </p>

        {/* Error message */}
        <pre
          className="bg-gray-100 text-gray-700 p-4 rounded-lg text-sm 
                       max-w-md overflow-auto border border-gray-300 w-full"
        >
          {error.message}
        </pre>

        <div className="flex gap-4 mt-4">
          {/* Retry Button — Fully reloads the page */}
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 
                       bg-gradient-to-r from-[#ffcfd8] to-[#ff7aa2] 
                       text-white font-bold rounded-xl shadow-lg 
                       hover:opacity-90 transition-all ring-2 ring-pink-200/50"
          >
            <RotateCcw className="w-5 h-5" />
            Reload Page
          </button>

          {/* Go Home Link */}
          <Link
            href="/"
            className="px-6 py-3 bg-white text-[#ff7aa2] font-semibold 
                       rounded-xl border-2 border-[#ff7aa2] 
                       hover:bg-[#ffe5ed] transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
