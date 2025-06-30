"use client";

import { useState } from "react";
import { PromptInput, PromptInputTextarea, PromptInputActions } from "@/components/ui/prompt-input";
import { Button } from "@/components/ui/button";
import { useVideoSearch } from "@/contexts/video-search-context";
import { Loader } from "lucide-react";
import { searchVideos } from "@/lib/services/api";
import { RuntimeClient } from "@/lib/services/RuntimeClient";

export function VideoSearchForm() {
  const [query, setQuery] = useState("");
  const { setResults, isLoading, setIsLoading } = useVideoSearch();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const result = await RuntimeClient.runPromise(searchVideos(query));
      setResults(result.data.map(item => ({
        ...item,
        thumbnails: [...item.thumbnails],
        duration: { ...item.duration },
        author: { ...item.author }
      })));
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      <PromptInput
        value={query}
        onValueChange={setQuery}
      >
        <PromptInputTextarea
          placeholder="Search for videos..."
          className="bg-transparent!"
          required
        />
        <PromptInputActions className="justify-end pt-2">
          <Button type="submit" disabled={isLoading} className="rounded-xl cursor-pointer">
            {isLoading ? <Loader className="size-4 animate-spin" /> : "Search"}
          </Button>
        </PromptInputActions>
      </PromptInput>
    </form>
  );
}