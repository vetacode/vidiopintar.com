"use server"

import { VideoRepository } from "@/lib/db/repository";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const YOUTUBE_REGEX = /(\?v=)([a-zA-Z0-9_\-]+)/;

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
  await new Promise((resolve) => setTimeout(resolve, 100));

  const videoUrl = formData.get("videoUrl") as string
  if (!videoUrl) return

  const videoId = await extractVideoId(videoUrl)
  if (!videoId) return

  redirect(`/video/${videoId}`);
}

const deleteSchema = z.object({
  id: z.string().min(1, { message: 'Video ID is required.' }),
});

export async function handleDeleteVideo(prevState: any, formData: FormData): Promise<{ success: boolean, errors: string[] | undefined }> {
  console.log(prevState);
  const validatedFields = deleteSchema.safeParse({
    id: formData.get("id"),
  });

  if (!validatedFields.success) {
    console.error("Validation Error:", validatedFields.error.flatten().fieldErrors.id);
    return { success: false, errors: validatedFields.error.flatten().fieldErrors.id };
  }

  const id = parseInt(validatedFields.data.id, 10);
  try {
    await VideoRepository.delete(id);
    revalidatePath('/home', 'page');
    return { success: true, errors: undefined };
  } catch (error) {
    console.error("Database Error: Failed to delete video:", error);
    return { success: false, errors: [`Failed to delete video`] };
  }
}