import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = await request.json();
    
    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: "Invalid username" }, { status: 400 });
    }

    await db
      .update(user)
      .set({ 
        name: username.trim(),
        updatedAt: new Date()
      })
      .where(eq(user.id, currentUser.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update username:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}