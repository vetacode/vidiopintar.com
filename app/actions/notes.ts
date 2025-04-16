"use server";
import { NoteRepository } from "@/lib/db/repository";
import type { NewNote } from "@/lib/db/schema";

export async function getNotesForVideo(videoId: string) {
  return NoteRepository.getByVideoId(videoId);
}

export async function saveNote(videoId: string, note: NewNote) {
  return NoteRepository.create({...note, videoId});
}
