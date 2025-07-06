import { getCurrentUser } from "@/lib/auth";
import { UserChats } from "../user-chats";

export default async function ChatsPage() {
  const user = await getCurrentUser();
  
  return (
    <div className="sm:px-6 lg:px-8">
      <h1 className="font-semibold mb-8">Chats</h1>
      <UserChats userId={user.id} />
    </div>
  );
}