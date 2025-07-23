"use client";

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
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
  className?: string;
}

const languageNames = {
  en: "English",
  id: "Bahasa Indonesia"
};

const locales: Language[] = ['en', 'id'];

export function LanguageSelector({ className }: LanguageSelectorProps) {
  const router = useRouter();
  const locale = useLocale();

  const handleLanguageChange = async (newLocale: Language) => {
    const languageName = languageNames[newLocale];
    
    // Set cookie for locale
    document.cookie = `locale=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`;
    
    // Sync to backend
    try {
      await fetch('/api/user/language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language: newLocale }),
      });
    } catch (error) {
      console.log('Failed to sync language preference to backend:', error);
    }
    
    // Refresh the page to apply new locale
    router.refresh();
    toast.success(`Language changed to ${languageName}`);
  };

  return (
    <Select value={locale} onValueChange={handleLanguageChange}>
      <SelectTrigger className={cn("w-[180px]", className)}>
        <SelectValue placeholder="Select a language" />
      </SelectTrigger>
      <SelectContent>
        {locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {languageNames[loc]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}