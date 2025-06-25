'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { VideoList } from "@/components/video-list"
import { Button } from "@/components/ui/button"

type Video = {
    userVideoId: number;
    youtubeId: string;
    title: string;
    channelTitle: string | null;
    publishedAt: Date | null;
    thumbnailUrl: string | null;
};

interface VideoListWithFilterProps {
    videos: Video[];
}

export function VideoListWithFilter({ videos }: VideoListWithFilterProps) {
    const [selectedChannel, setSelectedChannel] = useState<string | null>(null)

    // Get unique channels from videos
    const uniqueChannels = useMemo(() => {
        const channels = videos
            .map(video => video.channelTitle)
            .filter((channel): channel is string => channel !== null)
        return Array.from(new Set(channels))
    }, [videos])

    const filteredVideos = useMemo(() => {
        if (!selectedChannel) return videos
        
        return videos.filter(video => 
            video.channelTitle === selectedChannel
        )
    }, [videos, selectedChannel])

    return (
        <div className="max-w-4xl mx-auto w-full">
            <h2 className="text-xl font-semibold tracking-tighter mb-6">Your recent videos</h2>
            
            {/* Channel Filter Pills */}
            <div className="flex flex-wrap items-center gap-3 mb-8 overflow-x-auto py-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search..."
                        className="pl-10 ml-0.5 w-64 rounded-full"
                    />
                </div>
                <Button
                    variant={selectedChannel === null ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setSelectedChannel(null)}
                    className="rounded-full px-4 py-2 text-sm whitespace-nowrap"
                >
                    All Channels
                </Button>
                {uniqueChannels.map((channel) => (
                    <Button
                        key={channel}
                        variant={selectedChannel === channel ? "default" : "secondary"}
                        size="sm"
                        onClick={() => setSelectedChannel(channel)}
                        className="rounded-full px-4 py-2 text-sm whitespace-nowrap flex items-center gap-2"
                    >
                        {channel}
                    </Button>
                ))}
            </div>
            
            <VideoList videos={filteredVideos} />
        </div>
    )
}