import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
        return NextResponse.redirect(new URL("/", request.url));
    } else {
        if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register") {
            return NextResponse.redirect(new URL("/home", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/home", "/login", "/register"],
};
