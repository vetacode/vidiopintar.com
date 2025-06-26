import { getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env/server";
import { redirect } from "next/navigation";

export async function getCurrentUserWithAdminCheck() {
    const user = await getCurrentUser();
    return {
        ...user,
        isAdmin: user.email === env.ADMIN_MASTER_EMAIL
    };
}

export async function requireAdmin() {
    const user = await getCurrentUserWithAdminCheck();

    if (!user.isAdmin) {
        redirect("/home");
    }

    return user;
}
