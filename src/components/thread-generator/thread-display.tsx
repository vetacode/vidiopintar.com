"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Markdown } from "@/components/ui/markdown";

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

interface ThreadDisplayProps {
  threadData: ThreadData;
  videoDetails: VideoDetails | null;
}

export function ThreadDisplay({ threadData, videoDetails }: ThreadDisplayProps) {
  const { outline, threads } = threadData;
  const [showOutline, setShowOutline] = useState(false);

  return (
    <div className="space-y-6 mb-12">
      {/* Toggle for outline */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Generated Thread</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowOutline(!showOutline)}
          className="text-muted-foreground hover:text-foreground"
        >
          {showOutline ? <EyeOff className="size-4 mr-2" /> : <Eye className="size-4 mr-2" />}
          {showOutline ? "Hide" : "Show"} Strategy
        </Button>
      </div>

      <div className="flex gap-6 md:flex-row flex-col md:space-x-6 space-y-6 md:space-y-0">
        <div>
          {/* Collapsible Outline */}
          <Card className="border-dashed shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Thread Strategy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <h4 className="font-medium text-xs text-muted-foreground mb-1">Hook</h4>
                  <p className="text-sm p-2 bg-muted rounded">{outline.hook}</p>
                </div>
                <div>
                  <h4 className="font-medium text-xs text-muted-foreground mb-1">Pain Point</h4>
                  <p className="text-sm p-2 bg-muted rounded">{outline.painPoint}</p>
                </div>
                <div>
                  <h4 className="font-medium text-xs text-muted-foreground mb-1">Promise</h4>
                  <p className="text-sm p-2 bg-muted rounded">{outline.promise}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-xs text-muted-foreground mb-2">Key Points</h4>
                <ul className="space-y-1">
                  {outline.keyPoints.map((point, index) => (
                    <li key={index} className="text-sm p-2 bg-muted rounded flex items-start">
                      <span className="text-muted-foreground mr-2">{index + 1}.</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Thread Display */}
        <div className="space-y-3 max-w-md">
          {threads.map((tweet, index) => (
            <Card key={index} className={cn("group shadow-none")}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Show video thumbnail only in first thread */}
                    {index === 0 && videoDetails?.thumbnailUrl && (
                      <div className="mb-4">
                        <img
                          src={videoDetails.thumbnailUrl}
                          alt={videoDetails.title}
                          className="rounded-lg w-full"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="relative group prose dark:prose-invert prose-sm px-2 max-w-none">
                      <Markdown>
                        {tweet.content}
                      </Markdown>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton
                        content={tweet.content}
                        copyMessage="Tweet copied!"
                        label="Copy"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Copy All Button */}
      <div className="flex justify-center pt-4 mb-12">
        <CopyButton
          content={threads.map(t => t.content).join('\n\n')}
          copyMessage="Full thread copied!"
          label="Copy Full Thread"
        />
      </div>
    </div>
  );
}