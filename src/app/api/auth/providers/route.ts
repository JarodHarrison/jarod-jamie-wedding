import { NextResponse } from "next/server";
import { getAuthProviders } from "@/lib/auth/providers";

export async function GET() {
  return NextResponse.json(await getAuthProviders());
}
