"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function UserMenu({ user }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center hover:opacity-80"
      >
        <img
          src={user.image || "/default-avatar.png"}
          alt={user.name || "User"}
          className="h-8 w-8 rounded-full border border-gray-300"
          referrerPolicy="no-referrer"
        />
      </button>

      {/* drop down */}
      {open && (
        <div className="absolute right-0 mt-3 w-48 bg-brown-500 border-amber-500 shadow-xl rounded-xl p-2 text-sm border border-gray-100">
          <Link
            href="/profile"
            className="block px-3 py-2 rounded-lg hover:bg-gray-500"
          >
            My Profile
          </Link>

          <Link
            href="/orders"
            className="block px-3 py-2 rounded-lg hover:bg-gray-500"
          >
            My Orders
          </Link>

          <Link
            href="/wishlist"
            className="block px-3 py-2 rounded-lg hover:bg-gray-500"
          >
            Wish List
          </Link>

          <Link
            href="/cart"
            className="block px-3 py-2 rounded-lg hover:bg-gray-500"
          >
            My Cart
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-500 text-red-600"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
