import { getCurrentUser } from "@/lib/auth";
import { UserChats } from "../user-chats";
import { getTranslations } from 'next-intl/server';

export default async function ChatsPage() {
  const user = await getCurrentUser();
  const t = await getTranslations('profile');
  
  return (
    <div className="sm:px-6 lg:px-8">
      <h1 className="font-semibold mb-8">{t('profileSidebar.chats')}</h1>
      <UserChats userId={user.id} />
    </div>
  );
}