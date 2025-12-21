import NavBarAdmin from "@/components/NavBarAdmin";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function layout({ children }) {
  const session = await auth();

  // ❌ Not logged in → kick out
  if (!session?.user) {
    redirect("/signin");
  }

  // ❌ Logged in but not admin → kick out
  if (session.user.role !== "admin") {
    redirect("/");
  }

  // ✅ Admin is allowed here
  return (
    <div className="min-h-screen relative flex flex-col bg-linear-to-bl from-violet-100 to-stone-500">
      <NavBarAdmin />
      <div>{children}</div>
    </div>
  );
}
