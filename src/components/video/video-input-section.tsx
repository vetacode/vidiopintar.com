"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { VideoSubmitForm } from "./video-submit-form";
import { VideoSearchForm } from "./video-search-form";

export function VideoInputSection() {
  const [isSearchMode, setIsSearchMode] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {!isSearchMode ? <VideoSubmitForm /> : <VideoSearchForm />}
      <div className="flex items-center justify-center space-x-3">
        <Label htmlFor="mode-switch" className={!isSearchMode ? "font-semibold" : ""}>
          Submit URL
        </Label>
        <Switch
          id="mode-switch"
          checked={isSearchMode}
          onCheckedChange={setIsSearchMode}
          className="cursor-pointer"
        />
        <Label htmlFor="mode-switch" className={isSearchMode ? "font-semibold" : ""}>
          Search YouTube
        </Label>
      </div>      
    </div>
  );
}