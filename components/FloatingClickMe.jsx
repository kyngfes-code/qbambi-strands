"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function FloatingClickMe({ className = "" }) {
  return (
    <motion.div
      className={`fixed bottom-10 right-10 z-[9999] ${className}`}
      initial={{ y: 0 }}
      animate={{ y: [-10, 10, -10] }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <Link
        href="/saloon/images"
        className="text-white bg-[#C6A667] px-4 py-2 rounded-full shadow-xl 
                   font-bold text-lg animate-pulse"
      >
        👉 Click me
      </Link>
    </motion.div>
  );
}
