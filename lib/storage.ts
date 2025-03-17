import { db } from './db';
import { VideoRepository, MessageRepository, NoteRepository } from './db/repository';
import { fetchVideoDetails } from './youtube';
import { NewMessage, NewNote } from './db/schema';

export interface Message {
  id: string;
  content: string;
  sender: "user" | "system";
  timestamp: number;
}

export interface Note {
  id: string;
  content: string;
  timestamp: number;
}

// Cache for client-side rendering
const chatHistoryCache: Record<string, Message[]> = {};
const notesCache: Record<string, Note[]> = {};

// Chat functions
export async function getChatHistory(videoId: string): Promise<Message[]> {
  // For client-side rendering, use the cache
  if (typeof window !== 'undefined') {
    return chatHistoryCache[videoId] || [];
  }
  
  try {
    // For server-side rendering, fetch from the database
    const messages = await MessageRepository.getByVideoId(videoId);
    
    // Transform database messages to the expected format
    return messages.map(message => ({
      id: message.id,
      content: message.content,
      sender: message.sender as "user" | "system",
      timestamp: message.timestamp,
    }));
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
}

export async function addChatMessage(videoId: string, message: Message): Promise<void> {
  // Update the cache for client-side rendering
  if (!chatHistoryCache[videoId]) {
    chatHistoryCache[videoId] = [];
  }
  chatHistoryCache[videoId].push(message);
  
  try {
    // Ensure the video exists in the database
    await ensureVideoExists(videoId);
    
    // Save the message to the database
    const newMessage: NewMessage = {
      videoId,
      content: message.content,
      sender: message.sender,
      timestamp: message.timestamp,
    };
    
    await MessageRepository.create(newMessage);
  } catch (error) {
    console.error('Error adding chat message:', error);
  }
}

// Notes functions
export async function getNotesForVideo(videoId: string): Promise<Note[]> {
  // For client-side rendering, use the cache
  if (typeof window !== 'undefined') {
    return notesCache[videoId] || [];
  }
  
  try {
    // For server-side rendering, fetch from the database
    const notes = await NoteRepository.getByVideoId(videoId);
    
    // Transform database notes to the expected format
    return notes.map(note => ({
      id: note.id,
      content: note.content,
      timestamp: note.timestamp,
    }));
  } catch (error) {
    console.error('Error fetching notes:', error);
    return [];
  }
}

export async function saveNote(videoId: string, note: Note): Promise<void> {
  // Update the cache for client-side rendering
  if (!notesCache[videoId]) {
    notesCache[videoId] = [];
  }
  notesCache[videoId].push(note);
  
  try {
    // Ensure the video exists in the database
    await ensureVideoExists(videoId);
    
    // Save the note to the database
    const newNote: NewNote = {
      videoId,
      content: note.content,
      timestamp: note.timestamp,
    };
    
    await NoteRepository.create(newNote);
  } catch (error) {
    console.error('Error saving note:', error);
  }
}

// Helper function to ensure a video exists in the database
async function ensureVideoExists(youtubeId: string): Promise<void> {
  try {
    // Check if the video already exists
    const existingVideo = await VideoRepository.getByYoutubeId(youtubeId);
    
    if (!existingVideo) {
      // Fetch video details from YouTube
      const videoDetails = await fetchVideoDetails(youtubeId);
      
      // Create the video in the database
      await VideoRepository.create({
        youtubeId,
        title: videoDetails.title,
        description: videoDetails.description || '',
        channelTitle: videoDetails.channelTitle || '',
        publishedAt: videoDetails.publishedAt ? new Date(videoDetails.publishedAt) : new Date(),
        thumbnailUrl: videoDetails.thumbnails?.high?.url || '',
      });
    }
  } catch (error) {
    console.error('Error ensuring video exists:', error);
  }
}

