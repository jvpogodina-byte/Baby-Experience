import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";
import { MVP_USER_FEATURES } from "@/lib/feature-flags";

export async function middleware(request: NextRequest) {
  if (!MVP_USER_FEATURES.userDashboard && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  if (request.nextUrl.pathname.startsWith("/admin") && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"]
};
