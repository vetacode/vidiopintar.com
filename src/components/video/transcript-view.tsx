"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import FuzzySearch from "fuzzy-search"
import { Search, X } from "lucide-react"
import { useState } from "react"

interface TranscriptSegment {
  start: number
  end: number
  text: string
  isChapterStart?: boolean
}

interface TranscriptViewProps {
  transcript: {
    segments: TranscriptSegment[]
  }
}

export function TranscriptView({ transcript }: TranscriptViewProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredSegments = searchQuery
    ? (() => {
        const searcher = new FuzzySearch(transcript.segments, ["text"], {
          caseSensitive: false,
          sort: true,
        })
        const result = searcher.search(searchQuery)
        return result
      })()
    : transcript.segments

  return (
    <div className="space-y-4 py-4">
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>
        <Input
          placeholder="Search transcript..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            onClick={() => setSearchQuery("")}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="h-full max-h-[320px] overflow-y-auto">
        <div className="space-y-1">
          {filteredSegments.map((segment, index) => (
            <div
              key={index}
              className={`p-3 rounded-xl transition-all duration-200 hover:bg-secondary/40 ${
                searchQuery && segment.text.toLowerCase().includes(searchQuery.toLowerCase())
                  ? "bg-melody/10 border bg-accent border-melody/20"
                  : ""
              }`}
            >
              <div className="flex">
                <span className="text-muted-foreground font-mono mr-3 whitespace-nowrap">
                  {segment.start}
                </span>
                <span className="flex-1">{segment.text}</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
