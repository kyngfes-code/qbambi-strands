"use client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function SignInDropdownButton() {
  return (
    <div className="px-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
            Sign In
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="bg-brown">
          <DropdownMenuItem
            className="text-white"
            onClick={() => (window.location.href = "/api/auth/signin")}
          >
            Log In
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-white"
            onClick={() => (window.location.href = "")}
          >
            Sign Up
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
