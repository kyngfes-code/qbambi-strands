"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, AlertTriangle, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STATUS = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-green-600",
    bgClass: "bg-green-100",
    title: "Email Verified",
    description:
      "Your email address has been successfully verified. Your account is now active and you can sign in.",
    button: "Go to Login",
    href: "/login",
  },

  expired: {
    icon: AlertTriangle,
    iconClass: "text-amber-600",
    bgClass: "bg-amber-100",
    title: "Verification Link Expired",
    description:
      "Your verification link has expired. Please request a new verification email.",
    button: "Back to Sign Up",
    href: "/signup",
  },

  used: {
    icon: MailCheck,
    iconClass: "text-blue-600",
    bgClass: "bg-blue-100",
    title: "Already Verified",
    description:
      "This verification link has already been used. You can sign in to your account.",
    button: "Go to Login",
    href: "/login",
  },

  invalid: {
    icon: XCircle,
    iconClass: "text-red-600",
    bgClass: "bg-red-100",
    title: "Invalid Verification Link",
    description: "The verification link is invalid or no longer exists.",
    button: "Back to Sign Up",
    href: "/signup",
  },

  error: {
    icon: XCircle,
    iconClass: "text-red-600",
    bgClass: "bg-red-100",
    title: "Verification Failed",
    description:
      "Something went wrong while verifying your email. Please try again later.",
    button: "Back to Home",
    href: "/",
  },
};

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();

  const status = searchParams.get("status") || "error";

  const config = STATUS[status] || STATUS.error;

  const Icon = config.icon;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-neutral-50 via-white to-neutral-100 px-4 py-10">
      <Card className="w-full max-w-lg rounded-3xl shadow-xl">
        <CardContent className="flex flex-col items-center px-8 py-12 text-center">
          <div
            className={`mb-8 flex h-24 w-24 items-center justify-center rounded-full ${config.bgClass}`}
          >
            <Icon className={`h-12 w-12 ${config.iconClass}`} />
          </div>

          <h1 className="text-3xl font-bold tracking-tight">{config.title}</h1>

          <p className="mt-5 text-base leading-7 text-muted-foreground">
            {config.description}
          </p>

          <Button asChild className="mt-10 h-11 w-full rounded-xl">
            <Link href={config.href}>{config.button}</Link>
          </Button>

          {status === "expired" && (
            <p className="mt-6 text-sm text-muted-foreground">
              If you continue having issues, contact support or sign up again to
              receive a fresh verification email.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
