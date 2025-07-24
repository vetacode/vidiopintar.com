import { NextRequest, NextResponse } from 'next/server';

export default function middleware(_request: NextRequest) {
  // For now, just pass through all requests
  // You can add authentication or other logic here if needed
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};