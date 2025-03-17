"use client"

import { useState, useEffect, useRef } from "react"

interface VideoPlayerProps {
  videoId: string
}

export default function VideoPlayer({ videoId }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const handleIframeLoad = () => {
      setIsLoading(false)
    }

    const iframe = iframeRef.current
    if (iframe) {
      iframe.addEventListener("load", handleIframeLoad)
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener("load", handleIframeLoad)
      }
    }
  }, [videoId])

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/5 ambient-glow">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-spotify"></div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full"
      ></iframe>
    </div>
  )
}

