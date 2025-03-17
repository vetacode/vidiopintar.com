"use server"

import { redirect } from "next/navigation"
import { extractVideoId } from "@/lib/youtube"

export async function handleVideoSubmit(formData: FormData) {
  const videoUrl = formData.get("videoUrl") as string
  if (!videoUrl) return

  // add delay for 5 seconds
  await new Promise((resolve) => setTimeout(resolve, 5000))

  const videoId = extractVideoId(videoUrl)
  if (!videoId) return

  redirect(`/video/${videoId}`)
}

