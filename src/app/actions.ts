"use server"

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { UserVideoRepository } from "@/lib/db/repository";
import { extractVideoId } from "@/lib/utils";

export async function handleVideoSubmit(formData: FormData) {
  const videoUrl = formData.get("videoUrl") as string;
  if (!videoUrl) return;

  const youtubeVideoId = extractVideoId(videoUrl);
  if (!youtubeVideoId) return;

  redirect(`/video/${youtubeVideoId}`);
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
