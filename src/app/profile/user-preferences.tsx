"use client";

import { useLocalStorage } from "usehooks-ts";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type Language = "en" | "id";
type Theme = "light" | "dark" | "system";

interface UserPreferences {
  language: Language;
  theme: Theme;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  language: "en",
  theme: "system"
};

export function UserPreferences() {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
    "user-preferences",
    DEFAULT_PREFERENCES
  );
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (preferences.theme !== theme) {
      setTheme(preferences.theme);
    }
  }, [preferences.theme, theme, setTheme]);

  const handleLanguageChange = (language: Language) => {
    setPreferences((prev) => ({ ...prev, language }));
    const languageName = language === "en" ? "English" : "Bahasa Indonesia";
    toast.success(`Language changed to ${languageName}`);
  };

  const handleThemeChange = (theme: Theme) => {
    setPreferences((prev) => ({ ...prev, theme }));
    setTheme(theme);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-none">
      <h3 className="text-lg font-semibold mb-4">Prefrences</h3>
      <h4 className="text-md mb-4">Select Language</h4>
        <Select value={preferences.language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="id">Bahasa Indonesia</SelectItem>
          </SelectContent>
        </Select>
        <h4 className="text-md my-4">Select Theme</h4>
        <Select value={preferences.theme} onValueChange={handleThemeChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      <div className="text-sm text-gray-500 mt-4">
        <p>Your preferences are saved locally and will persist across sessions.</p>
      </div>
      </Card>
    </div>
  );
}