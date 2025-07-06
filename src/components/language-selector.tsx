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
import { cn } from "@/lib/utils";

type Language = "en" | "id";

interface LanguageSelectorProps {
  defaultLanguage?: Language;
  className?: string;
}

export function LanguageSelector({ defaultLanguage = "en", className }: LanguageSelectorProps) {
  const [language, setLanguage] = useLocalStorage<Language>("user-language", defaultLanguage);

  const handleLanguageChange = async (language: Language) => {
    setLanguage(language);
    const languageName = language === "en" ? "English" : "Bahasa Indonesia";
    
    // Sync to backend
    try {
      await fetch('/api/user/language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language }),
      });
    } catch (error) {
      console.log('Failed to sync language preference to backend:', error);
    }
    
    toast.success(`Language changed to ${languageName}`);
  };

  return (
    <Select value={language} onValueChange={handleLanguageChange}>
      <SelectTrigger className={cn("w-[180px]", className)}>
        <SelectValue placeholder="Select a language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="id">Bahasa Indonesia</SelectItem>
      </SelectContent>
    </Select>
  );
}