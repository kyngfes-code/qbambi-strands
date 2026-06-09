import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("payment_rejections")
      .select(
        `
        *,
        customer:user_id (
          id,
          name,
          email
        ),
        rejected_admin:rejected_by (
          id,
          name,
          email
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
