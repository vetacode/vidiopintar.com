import { getCurrentUser } from '@/lib/auth';
import { UserRepository } from '@/lib/db/repository';

export async function GET() {
  try {
    const user = await getCurrentUser();
    const language = await UserRepository.getPreferredLanguage(user.id);
    
    return Response.json({ language: language || 'en' });
  } catch (error) {
    console.error('Failed to get user language preference:', error);
    return Response.json({ language: 'en' }, { status: 200 }); // Default to English
  }
}