import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const response = NextResponse.next();
    // Handle OPTIONS preflight request
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: response.headers,
      });
    }
  
    const sessionCookie = getSessionCookie(request);
    const { pathname, origin } = request.nextUrl;

    const isAuthUrl = pathname === "/login" || pathname === "/register";

    if (isAuthUrl && sessionCookie) {
        return NextResponse.redirect(new URL("/home", request.url));
    }

    if (!sessionCookie && !isAuthUrl) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
}

export const config = {
    matcher: [
        "/home",
        "/video/:videoId",
        "/login",
        "/register",
        "/api/:path*",
    ],
};
