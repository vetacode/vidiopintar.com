import { Card } from "@/components/ui/card";
import { ProfileHeader } from "./profile-header";
import { ProfileTabs } from "./profile-tabs";
import { DeleteProfile } from "./delete-profile";

interface ProfileContentProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export function ProfileContent({ user }: ProfileContentProps) {
  return (
    <main className="relative min-h-screen p-6 overflow-hidden pt-24">
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tighter mb-2">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account and view your activity</p>
        </div>

        <div className="flex gap-8">
          <Card className="p-6 mb-8 shadow-none">
            <ProfileTabs userId={user.id} />
          </Card>
          <div>
            <Card className="p-6 mb-8 shadow-none space-y-8">
              <ProfileHeader user={user} />
              <DeleteProfile />
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}