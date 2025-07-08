"use client";

import { useState } from "react";
import { PromptInput, PromptInputTextarea, PromptInputActions } from "@/components/ui/prompt-input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader } from "lucide-react";
import { generateThreads } from "@/lib/services/api";
import { RuntimeClient } from "@/lib/services/RuntimeClient";
import { ThreadDisplay } from "./thread-display";

interface ThreadData {
  outline: {
    hook: string;
    painPoint: string;
    promise: string;
    keyPoints: string[];
  };
  threads: {
    tweetNumber: number;
    content: string;
    isOpening: boolean;
  }[];
}

interface VideoDetails {
  title: string;
  channelTitle: string;
  thumbnailUrl: string | null;
  publishedAt: string;
}

const SUPPORTED_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "id", label: "Indonesian" },
] as const;

export function ThreadGeneratorForm() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [threadData, setThreadData] = useState<ThreadData | null>(null);
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!youtubeUrl.trim()) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await RuntimeClient.runPromise(generateThreads(youtubeUrl, selectedLanguage));
      // Convert readonly arrays to mutable arrays
      const mutableData = {
        ...result.data,
        outline: {
          ...result.data.outline,
          keyPoints: [...result.data.outline.keyPoints]
        },
        threads: [...result.data.threads]
      };
      setThreadData(mutableData);
      setVideoDetails(result.videoDetails || null);
    } catch (error) {
      console.error("Thread generation failed:", error);
      setError("Failed to generate thread. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <PromptInput
        value={youtubeUrl}
        onValueChange={setYoutubeUrl}
        onSubmit={handleGenerate}
      >
        <PromptInputTextarea
          placeholder="Paste YouTube URL here (e.g., https://www.youtube.com/watch?v=...)"
          className="bg-transparent!"
          required
        />
        <PromptInputActions className="justify-end pt-2">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-fit">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleGenerate} 
            type="submit" 
            disabled={isLoading || !youtubeUrl.trim()} 
            className="rounded-xl cursor-pointer"
          >
            {isLoading ? <Loader className="size-4 animate-spin" /> : "Generate Thread"}
          </Button>
        </PromptInputActions>
      </PromptInput>

      {error && (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50 text-red-700">
          {error}
        </div>
      )}

      {threadData && <ThreadDisplay threadData={threadData} videoDetails={videoDetails} />}
    </div>
  );
}