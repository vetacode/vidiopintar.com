'use client';

import { useSearchParams, redirect } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { handleVideoSubmit } from '@/app/actions';
import { LoadingSpinner } from '@/components/ui/loading-spinner'; // Assuming this component exists

function WatchContentInternal() {
  const searchParams = useSearchParams();
  const videoIdFromUrl = searchParams.get('v');
  // Start with isProcessing as true if videoIdFromUrl is present, indicating processing should start.
  const [isProcessing, setIsProcessing] = useState(!!videoIdFromUrl);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (videoIdFromUrl) {
      // Ensure processing state is active and no previous error is shown
      setIsProcessing(true);
      setError(null);

      const formData = new FormData();
      formData.append('videoUrl', `https://www.youtube.com/watch?v=${videoIdFromUrl}`);

      handleVideoSubmit(formData)
        .then(() => {
          redirect(`/video/${videoIdFromUrl}`);
        })
        .catch((err) => {
          console.error("Error processing video via /watch page:", err);
          setError(err.message || 'An error occurred while processing the video. Please check the video ID or try again.');
          setIsProcessing(false); // Stop loading on error
        });
    } else {
      // No videoId in URL, redirect to home
      redirect('/home');
    }
  }, [videoIdFromUrl]); // Effect runs when videoIdFromUrl changes

  if (error) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-3">Processing Failed</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
        <a
          href="/home"
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Go to Home
        </a>
      </div>
    );
  }

  // Show loading spinner if we are in a processing state for a video from the URL
  if (isProcessing && videoIdFromUrl) {
    return (
      <div className="container mx-auto py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner text="Processing your video..." />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Please wait while we fetch and analyze the video details. You will be redirected shortly.
        </p>
      </div>
    );
  }

  // Fallback: Should be covered by redirect or error/loading states.
  // If videoIdFromUrl was null, redirect to /home would have occurred.
  return (
    <div className="container mx-auto py-12 text-center dark:text-white">
      Initializing page...
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-12 text-center flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner text="Loading..." />
      </div>
    }>
      <WatchContentInternal />
    </Suspense>
  );
}
