import { getCategoryBySlug } from "@/lib/data/categories";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HeroHeader } from "@/components/hero-header";
import { FooterSection } from "@/components/footer";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  description: string;
}

async function fetchVideos(searchQuery: string): Promise<Video[]> {
  try {
    const response = await fetch(`https://api.ahmadrosid.com/youtube/search?q=${encodeURIComponent(searchQuery)}`);

    if (!response.ok) {
      throw new Error('Failed to fetch videos');
    }

    const result = await response.json();
    const videos = result.data || [];

    return videos.map((item: any) => ({
      id: item.id,
      title: item.title,
      thumbnail: item.thumbnails?.[0]?.url || '',
      channelTitle: item.author?.name || '',
      publishedAt: item.published || '',
      description: item.description || ''
    }));
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
}

function VideoCard({ video }: { video: Video }) {
  return (
    <Card className=" dark:border-white/10 overflow-hidden rounded-2xl shadow-none">
      <CardContent className="p-0 relative">
        <Link href={`/video/${video.id}`}>
          <img
            src={video.thumbnail}
            alt={video.title}
            className="object-cover w-full h-40"
          />
        </Link>
      </CardContent>
      <CardHeader className="p-4">
        <CardTitle className="text-lg truncate hover:underline">
          <Link href={`/video/${video.id}`}>
            {video.title}
          </Link>
        </CardTitle>
        <CardDescription>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={`/video/${video.id}`}>
                  <Button variant="outline" className="rounded-xl">
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to chat with video</p>
              </TooltipContent>
            </Tooltip>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {video.channelTitle}
            </p>
        </div>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = getCategoryBySlug(params.slug);

  if (!category) {
    notFound();
  }

  const videos = await fetchVideos(category.searchQuery);

  return (
    <>
      <HeroHeader />
      <main className="relative min-h-screen p-6 overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto mt-24">
          {/* Hero Section with Background Image */}
          <div className="relative h-64 overflow-hidden rounded-2xl mb-8">
            <img
              src={category.image}
              alt={category.label}
              className="w-full h-fullobject-cover"
            />
            <div className="absolute inset-0 bg-black/45">
              <div className="flex flex-col justify-center items-center h-full p-8">
                <h1 className="text-5xl lg:text-6xl font-bold tracking-tighter mb-4 text-white">
                  {category.label}
                </h1>
                <p className="text-xl lg:text-2xl text-white/90">
                  Discover videos about {category.label.toLowerCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Video Cards Section */}
          <div className="max-w-4xl mx-auto w-full mb-8">
            {videos.length > 0 ? (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No videos found for this category. Please try again later.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <FooterSection />
    </>
  );
}