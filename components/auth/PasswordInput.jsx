"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PasswordInput = React.forwardRef(({ className = "", ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={showPassword ? "text" : "password"}
        className={`pr-12 ${className}`}
        {...props}
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 hover:bg-transparent"
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Eye className="h-4 w-4 text-muted-foreground" />
        )}

        <span className="sr-only">
          {showPassword ? "Hide password" : "Show password"}
        </span>
      </Button>
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
