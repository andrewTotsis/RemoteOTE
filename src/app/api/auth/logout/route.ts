import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  const session = await getSession();
  session.destroy();
  const url = new URL("/", req.url);
  return NextResponse.redirect(url, { status: 303 });
}
