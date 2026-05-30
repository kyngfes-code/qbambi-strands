import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import UserProfile from "@/components/UserProfile";
import UserOrders from "@/components/UserOrders";
import NavBar from "@/components/NavBar";

export default async function Page() {
  const session = await auth();
  const userSession = session?.user ?? null;

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const supabase = createSupabaseAdmin();
  const userId = session.user.id;

  // 1️⃣ Try fetch profile
  let { data: userProfile } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  // 2️⃣ If missing → create it
  if (!userProfile) {
    const { data: newProfile, error } = await supabase
      .from("users")
      .insert({
        id: userId,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role ?? "user",
      })
      .select()
      .single();

    if (error) {
      throw new Error("Failed to create user profile");
    }

    userProfile = newProfile;
  }

  // 2️⃣ Fetch recent orders
  const { data: userOrders } = await supabase
    .from("orders")
    .select(
      `
  id,
  total_amount,
  created_at,
  status,

  order_items (
    id,
    quantity,
    price,

    store (
      id,
      title,
      image,
      price
    )
  )
`,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <>
      <NavBar />

      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1">
            <UserProfile user={userProfile} />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2">
            <UserOrders orders={userOrders} />
          </div>
        </div>
      </main>
    </>
  );
}
