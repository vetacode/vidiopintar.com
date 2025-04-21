"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { videos } from '../lib/db/schema';
import { InferSelectModel } from 'drizzle-orm';

type Video = InferSelectModel<typeof videos>;

export function VideoList({ videos }: { videos: Video[] }) {
    if (videos.length === 0) return null;
    return (
        <div className="max-w-4xl mx-auto w-full">
            <h2 className="text-xl font-semibold text-left mb-8 tracking-tighter">Your recent videos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                    <Link key={video.id} href={`/video/${video.youtubeId}`}>
                        <Card className="hover:shadow-lg transition-shadow dark:border-white/10 overflow-hidden rounded-2xl">
                            <CardContent className="p-0">
                                <img
                                    src={video.thumbnailUrl!}
                                    alt={video.title}
                                    className="object-cover w-full h-48"
                                />
                            </CardContent>
                            <CardHeader className="p-4">
                                <CardTitle className="text-lg truncate">{video.title}</CardTitle>
                                <CardDescription className="text-sm text-muted-foreground truncate">
                                    {video.channelTitle}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}