import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: window ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL,
});
