import { PhoneIcon, Search } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "./ui/button";
import icon from "@/public/icon-flat-gold.png";
import StoreSearch from "./StoreSearch";
import { auth } from "@/lib/auth";
import UserMenu from "./UserMenu";
import SignInDropdownButton from "./SignInDropDownButton";

async function NavBarShop() {
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
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-2 py-2
                       border-b border-stone-300 bg-white/40 backdrop-blur-md font-bold"
    >
      <Logo
        height="40"
        width="40"
        src={icon}
        className="sm:hidden md:block md:text-sm"
      />

      <div className="flex px-2 items-center gap-4  rounded">
        <StoreSearch />
        <Button
          variant="default"
          size="xs"
          className="text-xs hidden sm:block sm:text-sm border p-1 border-[#D4AF37] text-[#D4AF37]hover:bg-[#D4AF37] hover:text-white"
        >
          Search
        </Button>
      </div>

      <div className="px-2 flex items-center gap-2">
        <PhoneIcon className="w-4 h-4" />
        <p className="text-sm font-medium">Call us 07036308292</p>
      </div>
      <div>
        {" "}
        {session?.user ? (
          <UserMenu user={user} />
        ) : (
          <div className="px-2">
            <SignInDropdownButton />
          </div>
        )}
      </div>
    </header>
  );
}

export default NavBarShop;
