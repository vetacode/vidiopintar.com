import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { extractVideoId } from '@/app/actions';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { fetchVideoDetails, fetchVideoTranscript } from '@/lib/youtube';

async function ProcessAndRedirect({ videoUrl }: { videoUrl: string }) {
  const videoId = await extractVideoId(videoUrl);
  if (!videoId) {
    return <div>Invalid video URL provided.</div>;
  }

  await Promise.all([
    fetchVideoDetails(videoId),
    fetchVideoTranscript(videoId)
  ]);
  
  redirect(`/video/${videoId}`);
  
  return null;
}

export default function WatchPage({ searchParams }: { searchParams: { v?: string } }) {
  if (!searchParams.v) {
    return <div className="container mx-auto py-12 text-center">Video ID is missing from URL.</div>;
  }

  return (
    <div className="container mx-auto py-12 text-center flex flex-col items-center justify-center min-h-screen">
      <Suspense fallback={<LoadingSpinner text="Processing video..." />}>
        <ProcessAndRedirect videoUrl={`https://www.youtube.com/watch?v=${searchParams.v}`} />
      </Suspense>
    </div>
  );
}
