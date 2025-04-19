'use client';

import { useSearchParams, redirect } from 'next/navigation';
import { useEffect } from 'react';
import { Suspense } from 'react';

function WatchContent() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get('v');

  useEffect(() => {
    if (videoId) {
      redirect(`/video/${videoId}`);
    } else {
      redirect('/home');
    }
  }, [videoId]);

  return <div className='dark:text-white'>Loading video...</div>;
}

export default function WatchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WatchContent />
    </Suspense>
  );
}
