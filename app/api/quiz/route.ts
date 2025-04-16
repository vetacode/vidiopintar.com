import { NextRequest, NextResponse } from "next/server";
import { getQuizzesForVideo, saveQuiz } from "@/app/actions/quiz";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("videoId");
  if (!videoId) return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
  const quizzes = await getQuizzesForVideo(videoId);
  return NextResponse.json(quizzes);
}

export async function POST(req: NextRequest) {
  const { videoId, quiz } = await req.json();
  if (!videoId || !quiz) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const saved = await saveQuiz(videoId, quiz);
  return NextResponse.json(saved);
}
