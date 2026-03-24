import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ONBOARDING_PATH = "/onboarding";
const PROTECTED_PREFIXES = ["/dashboard", "/swipe", "/gems"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const finishedOnboarding = request.cookies.get("finishedOnboarding")?.value === "1";

  if (pathname.startsWith(ONBOARDING_PATH) && finishedOnboarding) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) && !finishedOnboarding) {
    return NextResponse.redirect(new URL(ONBOARDING_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/onboarding/:path*", "/dashboard/:path*", "/swipe/:path*", "/gems/:path*"],
};
