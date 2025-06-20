import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const response = NextResponse.next();

    response.headers.set('Access-Control-Allow-Origin', '*'); // or specify origin
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
    // Handle OPTIONS preflight request
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: response.headers,
      });
    }
  
    const sessionCookie = getSessionCookie(request);
    const { pathname, origin } = request.nextUrl;

    if (!sessionCookie) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathname === "/login" || pathname === "/register" && sessionCookie) {
        const url = new URL(origin);
        url.pathname = "/home";
        return NextResponse.redirect(url);
    }

    return response;
}

export const config = {
    matcher: [
        "/home",
        "/video/:videoId",
        "/login",
        "/register",
    ],
};
