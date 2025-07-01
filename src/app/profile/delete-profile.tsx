"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DeleteProfile() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteProfile = async () => {
    if (!confirm("Are you sure you want to delete your profile? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to delete profile:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="p-6 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 shadow-none">
      <h2 className="text-xl font-semibold mb-2 text-red-900 dark:text-red-100">Danger Zone</h2>
      <p className="text-sm text-red-700 dark:text-red-300 mb-4">
        Once you delete your profile, there is no going back. Please be certain.
      </p>
      <Button
        variant="destructive"
        onClick={handleDeleteProfile}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        {isDeleting ? "Deleting..." : "Delete Profile"}
      </Button>
    </Card>
  );
}