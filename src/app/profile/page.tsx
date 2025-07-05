import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileSettings } from "./profile-settings";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return <ProfileSettings user={user} />;
}