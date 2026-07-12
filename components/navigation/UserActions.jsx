import { auth } from "@/lib/auth";

import UserMenu from "./UserMenu";
import AuthButtons from "./AuthButtons";

import Link from "next/link";

export default async function UserActions() {
  const session = await auth();

  return (
    <div className="hidden lg:flex items-center gap-4">
      <Link
        href="/cart"
        className="rounded-xl p-2 transition hover:bg-neutral-100"
      >
        🛒
      </Link>

      {session?.user ? <UserMenu session={session} /> : <AuthButtons />}
    </div>
  );
}
