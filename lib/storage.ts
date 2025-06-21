import { VideoRepository, MessageRepository, NoteRepository } from './db/repository';
import { fetchVideoDetails } from './youtube';
import type { NewNote, NewMessage } from "@/lib/db/schema";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: number;
}

export interface Note {
  id: string;
  content: string;
  timestamp: number;
}

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

interface Quiz {
  id: string
  title: string
  questions: QuizQuestion[]
  timestamp: number
}

// Cache for client-side rendering
const chatHistoryCache: Record<string, Message[]> = {};
const notesCache: Record<string, Note[]> = {};
const quizzes: Record<string, Quiz[]> = {}

export function getQuizzesForVideo(videoId: string): Quiz[] {
  return quizzes[videoId] || []
}

export function saveQuiz(videoId: string, quiz: Quiz): void {
  if (!quizzes[videoId]) {
    quizzes[videoId] = []
  }
  quizzes[videoId].unshift(quiz) // Add new quiz at the beginning
}

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
