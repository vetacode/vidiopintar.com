"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DeleteProfile } from "./delete-profile";
import { UserPreferences } from "./user-preferences";

interface ProfileSettingsProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  userLanguage: 'en' | 'id';
}

export function ProfileSettings({ user, userLanguage }: ProfileSettingsProps) {
  const profileName = user.name;
  const username = user.email.split("@")[0];

  const getInitials = () => {
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-none pt-6">
        <CardContent>
          <h1 className="text-lg font-semibold mb-8">Profile</h1>

          <div className="gap-4 flex">
            {/* Profile picture section */}
            <div>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border shadow-xs">
                  <AvatarImage src={user.image!} alt={user.name} />
                  <AvatarFallback className="bg-pink-200 text-xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div className="space-y-1">
                <p className="text-lg">{profileName}</p>
                <p className="text-lg">{user.email}</p>
            </div>

          </div>
        </CardContent>
      </Card>

      <UserPreferences defaultLanguage={userLanguage} />

      <DeleteProfile />
    </div>
  );
}