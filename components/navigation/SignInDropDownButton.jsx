"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

export default function SignInDropdownButton() {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-neutral-300 bg-white px-4 shadow-sm transition hover:bg-neutral-100"
        >
          Sign In
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl"
      >
        <div className="px-3 py-2">
          <p className="text-sm font-semibold text-neutral-900">Welcome</p>

          <p className="text-xs text-neutral-500">
            Sign in or create an account.
          </p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => router.push("/api/auth/signin")}
          className="cursor-pointer rounded-lg"
        >
          Log In
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/user" className="cursor-pointer rounded-lg">
            Create Account
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
