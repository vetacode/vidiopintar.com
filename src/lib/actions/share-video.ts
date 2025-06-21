"use server";

import { nanoid } from 'nanoid';
import { SharedVideoRepository, VideoRepository } from '@/lib/db/repository';
import { getCurrentUser } from '@/lib/auth';

/**
 * Generate a slug for sharing a video
 * @param length The length of the slug
 * @returns A random string for the slug
 */
function generateSlug(length: number = 8): string {
  return nanoid(length);
}

/**
 * Create a shared video link
 * @param youtubeId The YouTube ID of the video to share
 * @returns The slug for the shared video
 */
export async function createSharedVideo(youtubeId: string): Promise<string> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  // Check if the video exists
  const video = await VideoRepository.getByYoutubeId(youtubeId);
  if (!video) {
    throw new Error("Video not found");
  }

  // Check if the user has already shared this video
  const isAlreadyShared = await SharedVideoRepository.isSharedByOwner(youtubeId, user.id);
  if (isAlreadyShared) {
    // Find the existing shared video and return its slug
    const sharedVideos = await SharedVideoRepository.getByOwnerId(user.id);
    const existingShared = sharedVideos.find(sv => sv.youtubeId === youtubeId);
    if (existingShared) {
      return existingShared.slug;
    }
  }

  // Generate a unique slug
  const slug = generateSlug();

  // Create the shared video record
  await SharedVideoRepository.create({
    youtubeId,
    slug,
    ownerId: user.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return slug;
}

/**
 * Get the share URL for a video
 * @param youtubeId The YouTube ID of the video
 * @returns The full share URL
 */
export async function getShareUrl(youtubeId: string): Promise<string> {
  try {
    const slug = await createSharedVideo(youtubeId);
    return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shared/${slug}`;
  } catch (error) {
    console.error("Error creating share URL:", error);
    throw error;
  }
}
