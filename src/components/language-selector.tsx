"use client";

import { useLocalStorage } from "usehooks-ts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type Language = "en" | "id";

export function LanguageSelector() {
  const [language, setLanguage] = useLocalStorage<Language>("user-language", "en");

  const handleLanguageChange = (language: Language) => {
    setLanguage(language);
    const languageName = language === "en" ? "English" : "Bahasa Indonesia";
    toast.success(`Language changed to ${languageName}`);
  };

  return (
    <Select value={language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="id">Bahasa Indonesia</SelectItem>
      </SelectContent>
    </Select>
  );
}