"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { VideoSubmitForm } from "@/components/video/video-submit-form";
import { VideoSearchForm } from "@/components/video/video-search-form";
import { useLocalStorage, useIsClient } from 'usehooks-ts'

export function VideoInputSection() {
  const [isSearchMode, setIsSearchMode] = useLocalStorage('vidiopintar-switch-mode-key', false)
  const isClient = useIsClient()

  // Always render default state during SSR and initial hydration
  const effectiveSearchMode = isClient ? isSearchMode : false;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {!effectiveSearchMode ? <VideoSubmitForm /> : <VideoSearchForm />}
      <div className="flex items-center justify-center space-x-3">
        <Label htmlFor="mode-switch" className={!effectiveSearchMode ? "font-semibold" : "text-muted"}>
          Submit URL
        </Label>
        <Switch
          id="mode-switch"
          checked={effectiveSearchMode}
          onCheckedChange={setIsSearchMode}
          className="cursor-pointer"
        />
        <Label htmlFor="mode-switch" className={effectiveSearchMode ? "font-semibold" : "text-muted"}>
          Search videos
        </Label>
      </div>      
    </div>
  );
}