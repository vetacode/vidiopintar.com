'use client'

import { Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useDeleteVideoDialogStore } from '@/lib/store/dialog-store';
import { DeleteVideoDialog } from './delete-video-dialog';

type Video = {
    userVideoId: number;
    youtubeId: string;
    title: string;
    channelTitle: string | null;
    publishedAt: Date | null;
    thumbnailUrl: string | null;
};

interface VideoListProps {
    videos: Video[];
}

export function VideoList({ videos }: VideoListProps) {
    const { openDialog } = useDeleteVideoDialogStore();

    if (!videos || videos.length === 0) return <p className='text-center text-muted-foreground mt-10'>No videos uploaded yet.</p>;

    return (
        <>
            <DeleteVideoDialog /> 
            <div className="max-w-4xl mx-auto w-full">
                <h2 className="text-xl font-semibold text-left mb-8 tracking-tighter">Your recent videos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video) => (
                        <div key={video.userVideoId} className="relative group">
                            <Link href={`/video/${video.youtubeId}`}>
                                <Card className=" dark:border-white/10 overflow-hidden rounded-2xl">
                                    <CardContent className="p-0 relative">
                                        <img
                                            src={video.thumbnailUrl!}
                                            alt={video.title}
                                            className="object-cover w-full h-40"
                                        />
                                        <button
                                            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white p-1 rounded-lg z-10 cursor-pointer hover:text-red-500/80"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                openDialog(video.userVideoId);
                                            }}
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </CardContent>
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-lg truncate">{video.title}</CardTitle>
                                        <CardDescription className="text-sm text-muted-foreground truncate">
                                            {video.channelTitle}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}