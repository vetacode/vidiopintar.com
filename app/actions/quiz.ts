"use server";
import { QuizRepository } from "@/lib/db/repository";

export async function getQuizzesForVideo(videoId: string) {
  return QuizRepository.getByVideoId(videoId);
}

export async function saveQuiz(videoId: string, quiz: any) {
  // Implement your quiz save logic here
  return QuizRepository.create({...quiz, videoId});
}
