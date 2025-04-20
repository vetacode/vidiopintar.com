"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { MessageSquare, FileText, HelpCircle } from "lucide-react"
import { NotesSection } from "./note-section"
import { ChatMessages } from "./chat-message"
import QuizSection from "./quiz-section"
import ChatInterface from "./chat-interface"

interface TabInterface {
  videoId: string;
  initialMessages: any[];
}

export default function TabInterface({ videoId, initialMessages }: TabInterface) {
  const [activeTab, setActiveTab] = useState<"chat" | "notes">("chat")

  return (
    <Card className="flex flex-col h-full bg-melody-card rounded-2xl backdrop-blur-sm border border-white/5 overflow-hidden shadow-2xl">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "chat" | "notes")} className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-white/10 shrink-0">
          <TabsList className="w-full p-1 h-auto bg-secondary rounded-lg flex">
            <TabsTrigger value="chat" className="flex-1 rounded-sm data-[state=active]:bg-muted data-[state=active]:text-melody py-2">
              <span className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Chat</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex-1 rounded-sm data-[state=active]:bg-muted data-[state=active]:text-melody py-2">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Notes</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex-1 rounded-sm data-[state=active]:bg-muted data-[state=active]:text-melody py-2">
              <span className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                <span>Quiz</span>
              </span>
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="chat" className="h-full">
          <ChatInterface videoId={videoId} initialMessages={initialMessages} />
        </TabsContent>

        <TabsContent value="quiz" className="h-full">
          <QuizSection videoId={videoId} />
        </TabsContent>

        <TabsContent value="notes" className="h-full">
          <NotesSection videoId={videoId} />
        </TabsContent>
      </Tabs>
    </Card>
  )
}
