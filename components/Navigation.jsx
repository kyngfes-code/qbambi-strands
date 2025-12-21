import { auth } from "@/lib/auth";
import Link from "next/link";
import UserMenu from "./UserMenu"; // ✅ NEW CLIENT COMPONENT
import SignInDropdownButton from "./SignInDropDownButton";

export default async function Navigation({ className = "" }) {
  const session = await auth();
  const user = session?.user
    ? {
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
        role: session.user.role ?? "user",
      }
    : null;

  return (
    <nav className="z-10 text-xl">
      <ul
        className={`flex gap-2 text-stone-700 items-center sm:gap-4 sm:mx-2 sm:px-2 md:gap-4 lg:gap-8 ${className}`}
      >
        <li>
          <Link href="/" className="hover:text-accent-800 font-playfair">
            Home
          </Link>
        </li>
        <li className="sm:mr-4">
          <Link href="/store" className="hover:text-accent-400 font-playfair">
            Store
          </Link>
        </li>
        <li>
          <Link href="/saloon" className="hover:text-accent-400 font-playfair">
            Our Saloon
          </Link>
        </li>
        <li>
          <Link
            href="/makeUpStudio"
            className="hover:text-accent-400 font-playfair"
          >
            Make-up studio
          </Link>
        </li>
        <li>
          <Link href="/academy" className="hover:text-accent-400 font-playfair">
            Qbambi's Academy
          </Link>
        </li>
        <li className="sm:mr-6">
          <Link href="/about" className="hover:text-accent-400 font-playfair">
            About
          </Link>
        </li>

        <li>
          {session?.user ? (
            <UserMenu user={user} />
          ) : (
            <div className="px-2">
              <SignInDropdownButton />
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
}
