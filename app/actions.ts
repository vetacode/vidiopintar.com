"use server"

import { VideoRepository } from "@/lib/db/repository";
import { fetchVideoDetails, fetchVideoTranscript } from "@/lib/youtube"
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { UserVideoRepository } from "@/lib/db/repository";
import { extractVideoId } from "@/lib/utils";

export async function handleVideoSubmit(formData: FormData) {
  const videoUrl = formData.get("videoUrl") as string;
  if (!videoUrl) return;

  const videoId = extractVideoId(videoUrl);
  if (!videoId) return;

  // Fetch video details and transcript
  const videoDetails = await fetchVideoDetails(videoId);
  await fetchVideoTranscript(videoId);

  // Get current user (throws if not authenticated)
  const user = await getCurrentUser();

  // Upsert the global video entry
  await VideoRepository.upsert({
    youtubeId: videoId,
    title: videoDetails.title,
    description: videoDetails.description,
    channelTitle: videoDetails.channelTitle,
    publishedAt: videoDetails.publishedAt ? new Date(videoDetails.publishedAt) : null,
    thumbnailUrl:
      videoDetails.thumbnails?.high?.url ||
      videoDetails.thumbnails?.medium?.url ||
      videoDetails.thumbnails?.default?.url ||
      null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Create or upsert user_videos entry
  let userVideo = await UserVideoRepository.getByUserAndYoutubeId(user.id, videoId);
  if (!userVideo) {
    await UserVideoRepository.create({
      userId: user.id,
      youtubeId: videoId,
      summary: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  revalidatePath('/home', 'page');
  redirect(`/video/${videoId}`);
}


const deleteSchema = z.object({
  id: z.string().min(1, { message: 'Video ID is required.' }),
});

export async function handleDeleteVideo(prevState: any, formData: FormData): Promise<{ success: boolean, errors: string[] | undefined }> {
  const validatedFields = deleteSchema.safeParse({
    id: formData.get("id"),
  });

  if (!validatedFields.success) {
    console.error("Validation Error:", validatedFields.error.flatten().fieldErrors.id);
    return { success: false, errors: validatedFields.error.flatten().fieldErrors.id };
  }

  const id = parseInt(validatedFields.data.id, 10);
  try {
    await UserVideoRepository.delete(id);
    revalidatePath('/home', 'page');
    return { success: true, errors: undefined };
  } catch (error) {
    console.error("Database Error: Failed to delete video:", error);
    return { success: false, errors: [`Failed to delete video`] };
  }
}