"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProfileHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const router = useRouter();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [username, setUsername] = useState(user.name || "");
  const [tempUsername, setTempUsername] = useState(user.name || "");

  const handleSaveUsername = async () => {
    try {
      const response = await fetch("/api/user/update-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: tempUsername }),
      });

      if (response.ok) {
        setUsername(tempUsername);
        setIsEditingUsername(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update username:", error);
    }
  };

  const handleCancelEdit = () => {
    setTempUsername(username);
    setIsEditingUsername(false);
  };

  return (
    <div className="flex items-start space-x-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={user.image || undefined} />
        <AvatarFallback>{user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="mb-4">
          <Label htmlFor="username" className="text-xs mb-2 block">
            Full Name
          </Label>
          {isEditingUsername ? (
            <div className="flex items-center space-x-2">
              <Input
                id="username"
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                placeholder="Enter username"
                className="max-w-sm"
              />
              <Button
                size="sm"
                onClick={handleSaveUsername}
                disabled={!tempUsername.trim()}
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <p className="text-lg">
                {username || <span className="text-gray-400">No username set</span>}
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsEditingUsername(true);
                  setTempUsername(username);
                }}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="mb-4">
          <Label className="text-xs mb-2 block">Email</Label>
          <p className="text-lg">{user.email}</p>
        </div>
      </div>
    </div>
  );
}