import { getCurrentUser } from '@/lib/auth';
import { UserVideoRepository } from '@/lib/db/repository';

export async function POST(req: Request) {
  try {
    const { userVideoId } = await req.json();
    
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    const userVideo = await UserVideoRepository.getById(userVideoId);
    if (!userVideo || userVideo.userId !== user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Clear the messages by updating the userVideo record
    await UserVideoRepository.clearMessages(userVideoId);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Failed to clear messages:', error);
    return Response.json({ error: "Failed to clear messages" }, { status: 500 });
  }
}