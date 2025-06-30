"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface VideoResult {
  id: string;
  title: string;
  description: string;
  thumbnails: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  published: string;
  view_count: string;
  duration: {
    text: string;
    seconds: number;
  };
  author: {
    id: string;
    name: string;
  };
}

interface VideoSearchContextType {
  results: VideoResult[];
  setResults: (results: VideoResult[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const VideoSearchContext = createContext<VideoSearchContextType | undefined>(undefined);

export function VideoSearchProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<VideoResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <VideoSearchContext.Provider value={{ results, setResults, isLoading, setIsLoading }}>
      {children}
    </VideoSearchContext.Provider>
  );
}

export function useVideoSearch() {
  const context = useContext(VideoSearchContext);
  if (context === undefined) {
    throw new Error("useVideoSearch must be used within a VideoSearchProvider");
  }
  return context;
}