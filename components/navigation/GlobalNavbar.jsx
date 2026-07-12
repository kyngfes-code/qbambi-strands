import { auth } from "@/lib/auth";

import Logo from "./Logo";
import DesktopNavigation from "./DesktopNavigation";
import UserActions from "./UserActions";
import MobileNavigation from "./MobileNavigation";

export default async function GlobalNavbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <DesktopNavigation />

        <UserActions />

        <MobileNavigation session={session} />
      </div>
    </header>
  );
}
