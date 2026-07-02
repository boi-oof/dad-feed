import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  const token = match?.[1];

  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const { filename } = await request.json();
  const ext = (filename || "jpg").split(".").pop()?.toLowerCase() || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const supabase = getServiceClient();
  const { data, error } = await supabase.storage
    .from("photos")
    .createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "Could not prepare upload." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    path: data.path,
    token: data.token,
  });
}
