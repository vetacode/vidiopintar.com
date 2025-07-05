import { getCurrentUser } from "@/lib/auth";
import { UserChats } from "../user-chats";

export default async function SharedPage() {
  const user = await getCurrentUser();
  
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-8">Shared Chats</h1>
      <UserChats userId={user.id} />
    </div>
  );
}