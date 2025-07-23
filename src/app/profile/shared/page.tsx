import { getCurrentUser } from "@/lib/auth";
import { SharedChats } from "../shared-chats";
import { getTranslations } from 'next-intl/server';

export default async function SharedPage() {
  const user = await getCurrentUser();
  const t = await getTranslations('profile');
  
  return (
    <div>
      <h1 className="font-semibold mb-8">{t('sharedChats.title')}</h1>
      <SharedChats userId={user.id} />
    </div>
  );
}