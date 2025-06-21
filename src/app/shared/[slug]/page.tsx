import { notFound } from "next/navigation";
import { SharedVideoRepository, VideoRepository } from "@/lib/db/repository";
import { Metadata } from "next";

interface SharedVideoPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: SharedVideoPageProps): Promise<Metadata> {
  const { slug } = params;
  
  const sharedVideo = await SharedVideoRepository.getBySlugWithDetails(slug);
  
  if (!sharedVideo) {
    return {
      title: "Video Not Found",
    };
  }

  return {
    title: `${sharedVideo.title} - Shared Video`,
    description: sharedVideo.description || "Shared video from VidioPintar",
    openGraph: {
      title: sharedVideo.title,
      description: sharedVideo.description || "Shared video from VidioPintar",
      images: [{ url: sharedVideo.thumbnailUrl || "" }],
    },
  };
}

export default async function SharedVideoPage({ params }: SharedVideoPageProps) {
  const { slug } = params;
  
  const sharedVideo = await SharedVideoRepository.getBySlugWithDetails(slug);
  
  if (!sharedVideo) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">{sharedVideo.title}</h1>
      
      <div className="aspect-video mb-6">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${sharedVideo.youtubeId}`}
          title={sharedVideo.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Description</h2>
        <p className="whitespace-pre-line">{sharedVideo.description}</p>
      </div>
      
      <div className="text-sm text-gray-500">
        <p>Channel: {sharedVideo.channelTitle}</p>
        <p>Published: {new Date(sharedVideo.publishedAt || "").toLocaleDateString()}</p>
        <p>Shared: {new Date(sharedVideo.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
