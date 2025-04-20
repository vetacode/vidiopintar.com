"use server"

import { redirect } from "next/navigation"

export async function extractVideoId(url: string): Promise<string | null> {
  // Handle different YouTube URL formats
  const regexes = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/watch\?.*&v=)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ]

  for (const regex of regexes) {
    const match = url.match(regex)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

export async function handleVideoSubmit(formData: FormData) {
  // Show loading state for at least 500ms to prevent flickering
  await new Promise((resolve) => setTimeout(resolve, 500));

  const videoUrl = formData.get("videoUrl") as string
  if (!videoUrl) return

  const videoId = await extractVideoId(videoUrl)
  if (!videoId) return

  redirect(`/video/${videoId}`);
}

