import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileContent } from "./profile-content";
import { FooterSection } from "@/components/footer";
import { HeroHeader } from "@/components/hero-header";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <>
      <HeroHeader />
      <ProfileContent user={user} />
      <FooterSection />
    </>
  );
}