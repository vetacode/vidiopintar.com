import { getCurrentUser } from "@/lib/auth";
import { SharedChats } from "../shared-chats";

export default async function SharedPage() {
  const user = await getCurrentUser();
  
  return (
    <div>
      <h1 className="font-semibold mb-8">Shared Chats</h1>
      <SharedChats userId={user.id} />
    </div>
  );
}