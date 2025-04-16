"use server";
import { MessageRepository } from "@/lib/db/repository";

export async function getChatHistory(videoId: string) {
  return MessageRepository.getByVideoId(videoId);
}

export async function addChatMessage(videoId: string, message: any) {
  // Implement your chat message save logic here
  return MessageRepository.create({...message, videoId});
}
