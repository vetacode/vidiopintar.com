"use server";
import { NoteRepository } from "@/lib/db/repository";
import { InferInsertModel } from "drizzle-orm";
import { notes } from "@/lib/db/schema";
type NewNote = InferInsertModel<typeof notes>;

export async function getNotesForVideo(videoId: string) {
  return NoteRepository.getByVideoId(videoId);
}

export async function saveNote(videoId: string, note: NewNote) {
  return NoteRepository.create({...note, videoId});
}
