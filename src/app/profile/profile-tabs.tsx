import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense } from "react";
import { UserVideos } from "./user-videos";
import { UserChats } from "./user-chats";
import { SharedChats } from "./shared-chats";

interface ProfileTabsProps {
  userId: string;
}

function LoadingState() {
  return (
    <div className="text-center py-12 text-gray-500">
      <p>Loading...</p>
    </div>
  );
}

export function ProfileTabs({ userId }: ProfileTabsProps) {
  return (
    <Tabs defaultValue="videos" className="mb-8">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="videos" className="cursor-pointer">Latest videos</TabsTrigger>
        <TabsTrigger value="chats" className="cursor-pointer">Latest chats</TabsTrigger>
        <TabsTrigger value="shared" className="cursor-pointer">Shared chats</TabsTrigger>
      </TabsList>
      
      <TabsContent value="videos" className="mt-6">
        <Suspense fallback={<LoadingState />}>
          <UserVideos userId={userId} />
        </Suspense>
      </TabsContent>
      
      <TabsContent value="chats" className="mt-6">
        <Suspense fallback={<LoadingState />}>
          <UserChats userId={userId} />
        </Suspense>
      </TabsContent>
      
      <TabsContent value="shared" className="mt-6">
        <Suspense fallback={<LoadingState />}>
          <SharedChats userId={userId} />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}