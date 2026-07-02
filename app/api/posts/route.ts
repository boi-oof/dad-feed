import { NextResponse } from "next/server";
import { getServiceClient, getPublicClient } from "@/lib/supabase";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get("tag");

  const supabase = getPublicClient();
  let query = supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (tag) {
    query = query.contains("tags", [tag]);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ posts: data });
}

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  const token = match?.[1];

  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("photo") as File | null;
  const caption = (formData.get("caption") as string) || "";
  const tagsRaw = (formData.get("tags") as string) || "";
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  if (!file) {
    return NextResponse.json({ error: "No photo attached." }, { status: 400 });
  }

  const supabase = getServiceClient();

  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("photos")
    .upload(filename, bytes, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage
    .from("photos")
    .getPublicUrl(filename);

  // created_at is intentionally NOT taken from the client — the database
  // default (now()) stamps the true upload time server-side.
  const { data, error: insertError } = await supabase
    .from("posts")
    .insert({
      image_url: publicUrlData.publicUrl,
      caption,
      tags,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ post: data });
}
