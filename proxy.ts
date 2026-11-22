import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Logged-out visitors who open a dashboard or payment URL are sent to /sign-in and come
 * back to the exact page after signing in. This only checks that a session
 * cookie exists (no database call); the dashboard layouts still validate the
 * session and the user's role on the server.
 */
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) {
    return NextResponse.next();
  }

  const signIn = new URL("/sign-in", request.url);
  signIn.searchParams.set(
    "redirect",
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  );
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/dashboard/:path*", "/payment/:path*"],
};
