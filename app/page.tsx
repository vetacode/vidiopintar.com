"use server"
import { VideoRepository } from "@/lib/db/repository";
import VideoSubmitForm from "@/components/video-submit-form";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
  const videos = await VideoRepository.getAll();
  return (
    <main className="relative min-h-screen p-6 overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 ambient-dots opacity-30"></div>
      <div className="absolute top-1/4 -left-20 w-60 h-60 rounded-full bg-melody/10 blur-3xl animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-melody/10 blur-3xl animate-pulse-glow"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-8 p-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold tracking-tighter">Vidiopintar</h1>
            <p className="tracking-tight">Belajar lebih pintar dengan Vidiopintar</p>
          </div>
          <VideoSubmitForm />
        </div>
        {videos.length > 0 && (
          <div className="max-w-4xl mx-auto w-full">
            <h1 className="text-xl font-bold text-left mb-8 tracking-tighter">All Videos</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <Link key={video.id} href={`/video/${video.youtubeId}`}>
                  <Card className="hover:shadow-lg transition-shadow dark:border-white/10">
                    <CardContent className="p-0">
                      <img
                        src={video.thumbnailUrl!}
                        alt={video.title}
                        className="object-cover w-full h-48 rounded-t-lg"
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
        )}

      </div>
    </main>
  );
}
