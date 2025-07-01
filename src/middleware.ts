import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || request.ip;
    const sessionCookie = getSessionCookie(request);

    console.log({ ip });

    if (!sessionCookie) {
        if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register") {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/home", "/login", "/register"],
};
