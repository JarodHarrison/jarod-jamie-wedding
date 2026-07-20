import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Case-sensitive lowercase → canonical paths (config redirects loop because they are case-insensitive). */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/bucksparty") {
    const url = request.nextUrl.clone();
    url.pathname = "/Bucksparty";
    return NextResponse.redirect(url);
  }
  if (pathname === "/glowup") {
    const url = request.nextUrl.clone();
    url.pathname = "/Glowup";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/bucksparty", "/glowup"],
};
