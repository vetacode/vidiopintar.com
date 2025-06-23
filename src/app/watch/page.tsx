import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { extractVideoId } from '@/lib/utils';
import { processVideo } from '@/app/actions';

async function ProcessAndRedirect({ videoUrl }: { videoUrl: string }) {
  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    return <div>Invalid video URL provided.</div>;
  }

  // await new Promise((resolve) => setTimeout(resolve, 2000));
  // throw new Error('Failed to process video');

  await processVideo(videoId);

  redirect(`/video/${videoId}`);

  return null;
}

export default function WatchPage({ searchParams }: { searchParams: { v?: string } }) {
  if (!searchParams.v) {
    return <div className="container mx-auto py-12 text-center">Video ID is missing from URL.</div>;
  }

  return (
    <div className="container mx-auto py-12 text-center flex flex-col items-center justify-center min-h-screen">
      <Suspense fallback={<LoadingSpinner text="Please wait processing video..." />}>
        <ProcessAndRedirect videoUrl={`https://www.youtube.com/watch?v=${searchParams.v}`} />
      </Suspense>
    </div>
  );
}
