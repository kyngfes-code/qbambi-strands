export async function POST(req) {
  const { orderId, action } = await req.json();
  const supabase = createSupabaseAdmin();

  await supabase
    .from("orders")
    .update({
      status: action === "confirm" ? "paid" : "rejected",
      confirmed_at: new Date(),
    })
    .eq("id", orderId);

  return NextResponse.json({ success: true });
}
