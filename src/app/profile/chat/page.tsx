import { getCurrentUser } from "@/lib/auth";
import { UserChats } from "../user-chats";

export default async function SharedPage() {
  const user = await getCurrentUser();
  
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <h1 className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8">Shared Chats</h1>
      <UserChats userId={user.id} />
    </div>
  );
}