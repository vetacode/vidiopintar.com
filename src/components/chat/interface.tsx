"use client"

import { useChat } from "@ai-sdk/react";
import { ArrowUp, Square} from "lucide-react"
import { flushSync } from "react-dom"
import { Button } from "@/components/ui/button"
import { ChatContainerRoot } from "@/components/ui/chat-container"
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input"
import { ChatHeader } from "@/components/chat/header";
import { MessageItem } from "./message-item";

interface ChatInterfaceProps {
  videoId: string;
  userVideoId: number;
  quickStartQuestions: string[];
  initialMessages: any[];
  isSharePage?: boolean;
  isLoggedIn?: boolean;
  shareChatUrl?: string;
}

export function ChatInterface({ 
  videoId,
  userVideoId,
  initialMessages,
  quickStartQuestions,
  shareChatUrl,
  isSharePage = false,
  isLoggedIn = false }: ChatInterfaceProps) {
  const {
    messages,
    input,
    setInput,
    handleSubmit,
    status,
    setMessages,
  } = useChat({
    api: '/api/chat',
    initialMessages,
    body: { videoId, userVideoId },
  });

  return (
    <div className="flex h-screen h-screen-dvh w-full flex-col overflow-hidden border-l">
      <ChatHeader 
        videoId={videoId}
        userVideoId={userVideoId}
        shareChatUrl={shareChatUrl}
        setMessages={setMessages}
        isSharePage={isSharePage}
      />
      <ChatContainerRoot className="flex-1">
        {messages.length === 0 && quickStartQuestions.length > 0 ? (
          <div className="flex flex-col gap-4 p-4 h-full justify-center">
            <div>
              <p className="text-left py-2 text-foreground/75 font-semibold tracking-tight">
                Start your video chat with these quick questions!
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {quickStartQuestions.map((question, index) => (
                <form
                  key={index}
                  onSubmit={(e) => {
                    handleSubmit(e as any);
                  }}>
                  <button
                    type="submit"
                    onClick={() => flushSync(() => setInput(question))}
                    className="text-sm text-left p-2 rounded bg-secondary border border-border/25 text-foreground/85 cursor-pointer hover:border-accent-foreground/75">
                    {question}
                  </button>
                </form>
              ))}
            </div>
          </div>
        ) : (
          <MessageItem
            messages={messages}
            status={status}
            isLoggedIn={isLoggedIn}
          />
        )}
      </ChatContainerRoot>
      <div className="p-4">
        {isSharePage ? (
          <div className="text-center text-sm text-muted-foreground">
            {isLoggedIn ? (
              <a href={`/video/${videoId}`}>
                <Button variant="outline">
                  Click to continue the conversation
                </Button>
              </a>
            ) : (
              <a href="/login">
                <Button variant="outline">
                  Login to start your conversation
                </Button>
              </a>
            )}
          </div>
        ) : (
          <PromptInput
            value={input}
            onValueChange={(value) => setInput(value)}
            isLoading={status === "streaming"}
            onSubmit={handleSubmit}
            className="w-full"
          >
            <PromptInputTextarea placeholder="Ask anything..." />
            <PromptInputActions className="justify-end pt-2">
              <PromptInputAction
                tooltip={status === "streaming" ? "Stop generation" : "Send message"}
              >
                <Button
                  variant="default"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleSubmit}
                >
                  {status === "streaming" ? (
                    <Square className="size-5 fill-current" />
                  ) : (
                    <ArrowUp className="size-5" />
                  )}
                </Button>
              </PromptInputAction>
            </PromptInputActions>
          </PromptInput>
        )}
      </div>
    </div>
  )
}
