import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileSettings } from "./profile-settings";
import { UserRepository } from "@/lib/db/repository";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  // Get user's language preference from database
  let userLanguage: 'en' | 'id' = 'en';
  try {
    const savedLanguage = await UserRepository.getPreferredLanguage(user.id);
    if (savedLanguage === 'en' || savedLanguage === 'id') {
      userLanguage = savedLanguage;
    }
  } catch (error) {
    console.log('Could not get user language preference, using default:', error);
  }

  return <ProfileSettings user={user} userLanguage={userLanguage} />;
}