import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
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

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/home",
        "/video/:videoId",
        "/login",
        "/register",
    ],
};
