"use server";
import { MessageRepository } from "@/lib/db/repository";

export async function getChatHistory(id: number) {
  return MessageRepository.getByUserVideoId(id);
}

export async function addChatMessage(id: number, message: any) {
  return MessageRepository.create({...message, userVideoId: id});
}
