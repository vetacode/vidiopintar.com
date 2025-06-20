import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const sessionCookie = getSessionCookie(request);
    const { pathname } = request.nextUrl;

    const isAuthUrl = pathname === "/login" || pathname === "/register";

    if (isAuthUrl && sessionCookie) {
        return NextResponse.redirect(new URL("/home", request.url));
    }

    // Redirect unauthenticated users to home page if they're trying to access protected routes except auth url
    if (!sessionCookie && !isAuthUrl) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
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
