import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const body = await request.json();
  const caption = body.caption || "";
  const tags = (body.tags || [])
    .map((t: string) => t.trim().toLowerCase())
    .filter(Boolean);
  const path = body.path;

  if (!path) {
    return NextResponse.json({ error: "No photo attached." }, { status: 400 });
  }

  const supabase = getServiceClient();

  const { data: publicUrlData } = supabase.storage
    .from("photos")
    .getPublicUrl(path);

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
