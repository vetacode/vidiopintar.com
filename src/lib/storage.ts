import { MessageRepository } from './db/repository';
import type { NewMessage } from "@/lib/db/schema";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: number;
}

const chatHistoryCache: Record<string, Message[]> = {};

export async function getChatHistory(userVideoId: number): Promise<Message[]> {
  try {
    const messages = await MessageRepository.getByUserVideoId(userVideoId);
    
    return messages.map(message => ({
      id: message.id,
      content: message.content,
      role: message.role as "user" | "assistant",
      timestamp: message.timestamp,
    }));
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
}

export async function addChatMessage(userVideoId: number, message: Message): Promise<void> {
  if (!chatHistoryCache[userVideoId]) {
    chatHistoryCache[userVideoId] = [];
  }
  chatHistoryCache[userVideoId].push(message);
  
  try {
    const newMessage: NewMessage = {
      userVideoId,
      content: message.content,
      role: message.role,
      timestamp: message.timestamp,
    };
    
    await MessageRepository.create(newMessage);
  } catch (error) {
    console.error('Error adding chat message:', error);
  }
}
